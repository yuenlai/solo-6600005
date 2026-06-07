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
        SimpMessageHeaderAccessor headers = SimpMessageHeaderAccessor.wrap(event.getMessage());
        Map<String, Object> attributes = headers.getSessionAttributes();

        if (attributes != null) {
            String roomId = (String) attributes.get("roomId");
            String userId = (String) attributes.get("userId");
            String userName = (String) attributes.get("userName");
            String userRole = (String) attributes.get("userRole");

            logger.info("WebSocket connected - roomId: {}, userId: {}, userName: {}, userRole: {}",
                    roomId, userId, userName, userRole);

            if (roomId != null && userId != null) {
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
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        SimpMessageHeaderAccessor headers = SimpMessageHeaderAccessor.wrap(event.getMessage());
        Map<String, Object> attributes = headers.getSessionAttributes();

        if (attributes != null) {
            String roomId = (String) attributes.get("roomId");
            String userId = (String) attributes.get("userId");

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
}
