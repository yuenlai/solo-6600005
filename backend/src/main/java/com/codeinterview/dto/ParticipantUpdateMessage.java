package com.codeinterview.dto;

import com.codeinterview.model.ParticipantStatus;

public class ParticipantUpdateMessage {
    private String roomId;
    private ParticipantStatus participant;
    private String action;

    public ParticipantUpdateMessage() {
    }

    public ParticipantUpdateMessage(String roomId, ParticipantStatus participant, String action) {
        this.roomId = roomId;
        this.participant = participant;
        this.action = action;
    }

    public String getRoomId() {
        return roomId;
    }

    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }

    public ParticipantStatus getParticipant() {
        return participant;
    }

    public void setParticipant(ParticipantStatus participant) {
        this.participant = participant;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }
}
