package com.codeinterview.dto;

import com.codeinterview.model.InterviewRoom;
import com.codeinterview.model.ParticipantStatus;

public class JoinRoomResponse {
    private ParticipantStatus participant;
    private InterviewRoom room;
    private String message;

    public JoinRoomResponse() {
    }

    public JoinRoomResponse(ParticipantStatus participant, InterviewRoom room, String message) {
        this.participant = participant;
        this.room = room;
        this.message = message;
    }

    public ParticipantStatus getParticipant() {
        return participant;
    }

    public void setParticipant(ParticipantStatus participant) {
        this.participant = participant;
    }

    public InterviewRoom getRoom() {
        return room;
    }

    public void setRoom(InterviewRoom room) {
        this.room = room;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
