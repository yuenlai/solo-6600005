package com.codeinterview.config;

import com.codeinterview.model.ParticipantStatus;
import com.codeinterview.repository.ParticipantStatusRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Component
public class WebSocketEventListener {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketEventListener.class);

    @Autowired
    private ParticipantStatusRepository participantStatusRepository;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        SimpMessageHeaderAccessor headerAccessor = SimpMessageHeaderAccessor.wrap(event.getMessage());
        Map<String, Object> attributes = headerAccessor.getSessionAttributes();

        String roomId = headerAccessor.getFirstNativeHeader("roomId");
        String userId = headerAccessor.getFirstNativeHeader("userId");
        String userName = headerAccessor.getFirstNativeHeader("userName");
        String userRole = headerAccessor.getFirstNativeHeader("userRole");

        if (roomId == null && attributes != null) {
            roomId = (String) attributes.get("roomId");
        }
        if (userId == null && attributes != null) {
            userId = (String) attributes.get("userId");
        }
        if (userName == null && attributes != null) {
            userName = (String) attributes.get("userName");
        }
        if (userRole == null && attributes != null) {
            userRole = (String) attributes.get("userRole");
        }

        logger.info("WebSocket connected - roomId: {}, userId: {}, userName: {}, userRole: {}",
                roomId, userId, userName, userRole);

        if (roomId != null && userId != null) {
            if (attributes != null) {
                attributes.put("roomId", roomId);
                attributes.put("userId", userId);
                attributes.put("userName", userName);
                attributes.put("userRole", userRole);
            }

            Optional<ParticipantStatus> existing = participantStatusRepository.findByRoomIdAndUserId(roomId, userId);
            ParticipantStatus status;
            if (existing.isPresent()) {
                status = existing.get();
                status.setOnline(true);
                status.setLastHeartbeat(LocalDateTime.now());
            } else {
                status = new ParticipantStatus();
                status.setRoomId(roomId);
                status.setUserId(userId);
                status.setUserName(userName);
                status.setUserRole(userRole);
                status.setOnline(true);
                status.setJoinedAt(LocalDateTime.now());
                status.setLastHeartbeat(LocalDateTime.now());
            }
            participantStatusRepository.save(status);
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        SimpMessageHeaderAccessor headerAccessor = SimpMessageHeaderAccessor.wrap(event.getMessage());
        Map<String, Object> attributes = headerAccessor.getSessionAttributes();

        String roomId = headerAccessor.getFirstNativeHeader("roomId");
        String userId = headerAccessor.getFirstNativeHeader("userId");

        if (roomId == null && attributes != null) {
            roomId = (String) attributes.get("roomId");
        }
        if (userId == null && attributes != null) {
            userId = (String) attributes.get("userId");
        }

        logger.info("WebSocket disconnected - roomId: {}, userId: {}", roomId, userId);

        if (roomId != null && userId != null) {
            Optional<ParticipantStatus> existing = participantStatusRepository.findByRoomIdAndUserId(roomId, userId);
            if (existing.isPresent()) {
                ParticipantStatus status = existing.get();
                status.setOnline(false);
                status.setLastHeartbeat(LocalDateTime.now());
                participantStatusRepository.save(status);
            }
        }
    }
}
