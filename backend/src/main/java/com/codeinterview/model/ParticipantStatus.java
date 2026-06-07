package com.codeinterview.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "participant_statuses")
public class ParticipantStatus {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private String roomId;
    private String userId;
    private String userName;
    private String userRole;
    private boolean isOnline;
    private LocalDateTime lastHeartbeat;
    private LocalDateTime joinedAt;

    @Transient
    private transient String unifiedUserId;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getRoomId() { return roomId; }
    public void setRoomId(String roomId) { this.roomId = roomId; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public String getUserRole() { return userRole; }
    public void setUserRole(String userRole) { this.userRole = userRole; }
    public boolean isOnline() { return isOnline; }
    public void setOnline(boolean online) { isOnline = online; }
    public LocalDateTime getLastHeartbeat() { return lastHeartbeat; }
    public void setLastHeartbeat(LocalDateTime lastHeartbeat) { this.lastHeartbeat = lastHeartbeat; }
    public LocalDateTime getJoinedAt() { return joinedAt; }
    public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }

    public String getUnifiedUserId() {
        return this.id;
    }

    public void setUnifiedUserId(String unifiedUserId) {
        this.unifiedUserId = unifiedUserId;
    }
}
