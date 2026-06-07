package com.codeinterview.dto;

import java.time.LocalDateTime;

public class WebSocketMessage<T> {
    private String type;
    private T payload;
    private LocalDateTime timestamp;

    public WebSocketMessage() {
        this.timestamp = LocalDateTime.now();
    }

    public WebSocketMessage(String type, T payload) {
        this.type = type;
        this.payload = payload;
        this.timestamp = LocalDateTime.now();
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public T getPayload() {
        return payload;
    }

    public void setPayload(T payload) {
        this.payload = payload;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
