package com.codeinterview.controller;

import com.codeinterview.dto.ParticipantUpdateMessage;
import com.codeinterview.dto.WebSocketMessage;
import com.codeinterview.model.InterviewRoom;
import com.codeinterview.model.ParticipantStatus;
import com.codeinterview.repository.InterviewRoomRepository;
import com.codeinterview.repository.ParticipantStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Controller
public class WebSocketController {

    @Autowired
    private ParticipantStatusRepository participantStatusRepository;

    @Autowired
    private InterviewRoomRepository interviewRoomRepository;

    @MessageMapping("/room/{roomId}/participants")
    @SendTo("/topic/room/{roomId}/participants")
    public WebSocketMessage<List<ParticipantStatus>> getRoomParticipants(
            @DestinationVariable String roomId,
            SimpMessageHeaderAccessor headerAccessor) {

        Map<String, Object> attributes = headerAccessor.getSessionAttributes();
        if (attributes != null) {
            attributes.put("roomId", roomId);
        }

        List<ParticipantStatus> participants = participantStatusRepository.findByRoomId(roomId);
        return new WebSocketMessage<>("PARTICIPANTS_LIST", participants);
    }

    @MessageMapping("/room/{roomId}/status")
    @SendTo("/topic/room/{roomId}/status")
    public WebSocketMessage<InterviewRoom> getRoomStatus(
            @DestinationVariable String roomId,
            SimpMessageHeaderAccessor headerAccessor) {

        Map<String, Object> attributes = headerAccessor.getSessionAttributes();
        if (attributes != null) {
            attributes.put("roomId", roomId);
        }

        Optional<InterviewRoom> room = interviewRoomRepository.findById(roomId);
        return new WebSocketMessage<>("ROOM_STATUS", room.orElse(null));
    }

    @MessageMapping("/heartbeat")
    @SendTo("/topic/heartbeat")
    public WebSocketMessage<ParticipantUpdateMessage> handleHeartbeat(
            WebSocketMessage<Map<String, String>> message,
            SimpMessageHeaderAccessor headerAccessor) {

        Map<String, String> payload = message.getPayload();
        String roomId = payload.get("roomId");
        String userId = payload.get("userId");

        Map<String, Object> attributes = headerAccessor.getSessionAttributes();
        if (attributes != null) {
            if (roomId != null) attributes.put("roomId", roomId);
            if (userId != null) attributes.put("userId", userId);
            if (payload.get("userName") != null) attributes.put("userName", payload.get("userName"));
            if (payload.get("userRole") != null) attributes.put("userRole", payload.get("userRole"));
        }

        if (roomId != null && userId != null) {
            Optional<ParticipantStatus> existing = participantStatusRepository.findByRoomIdAndUserId(roomId, userId);
            if (existing.isPresent()) {
                ParticipantStatus status = existing.get();
                status.setOnline(true);
                status.setLastHeartbeat(LocalDateTime.now());
                participantStatusRepository.save(status);

                ParticipantUpdateMessage update = new ParticipantUpdateMessage(roomId, status, "HEARTBEAT");
                return new WebSocketMessage<>("PARTICIPANT_UPDATE", update);
            }
        }

        return new WebSocketMessage<>("HEARTBEAT_ACK", null);
    }
}
