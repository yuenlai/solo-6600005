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
    public WebSocketMessage<List<ParticipantStatus>> handleHeartbeat(
            WebSocketMessage<Map<String, String>> message,
            SimpMessageHeaderAccessor headerAccessor) {

        Map<String, String> payload = message.getPayload();

        String roomId = headerAccessor.getFirstNativeHeader("roomId");
        String userId = headerAccessor.getFirstNativeHeader("userId");
        String userName = headerAccessor.getFirstNativeHeader("userName");
        String userRole = headerAccessor.getFirstNativeHeader("userRole");

        if (roomId == null && payload != null) {
            roomId = payload.get("roomId");
        }
        if (userId == null && payload != null) {
            userId = payload.get("userId");
        }
        if (userName == null && payload != null) {
            userName = payload.get("userName");
        }
        if (userRole == null && payload != null) {
            userRole = payload.get("userRole");
        }

        Map<String, Object> attributes = headerAccessor.getSessionAttributes();
        if (attributes != null) {
            if (roomId != null) attributes.put("roomId", roomId);
            if (userId != null) attributes.put("userId", userId);
            if (userName != null) attributes.put("userName", userName);
            if (userRole != null) attributes.put("userRole", userRole);
        }

        if (roomId != null && userId != null) {
            Optional<ParticipantStatus> existing = participantStatusRepository.findByRoomIdAndUserId(roomId, userId);
            if (existing.isPresent()) {
                ParticipantStatus status = existing.get();
                status.setOnline(true);
                status.setLastHeartbeat(LocalDateTime.now());
                if (userName != null) {
                    status.setUserName(userName);
                }
                if (userRole != null) {
                    status.setUserRole(userRole);
                }
                participantStatusRepository.save(status);
            } else {
                ParticipantStatus status = new ParticipantStatus();
                status.setRoomId(roomId);
                status.setUserId(userId);
                status.setUserName(userName);
                status.setUserRole(userRole);
                status.setOnline(true);
                status.setJoinedAt(LocalDateTime.now());
                status.setLastHeartbeat(LocalDateTime.now());
                participantStatusRepository.save(status);
            }

            List<ParticipantStatus> participants = participantStatusRepository.findByRoomId(roomId);
            return new WebSocketMessage<>("PARTICIPANTS_LIST", participants);
        }

        return new WebSocketMessage<>("HEARTBEAT_ACK", null);
    }
}
