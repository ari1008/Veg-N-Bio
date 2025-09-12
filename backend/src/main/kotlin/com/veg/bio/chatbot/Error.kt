package com.veg.bio.chatbot

class ChatbotSessionNotFoundException(message: String) : RuntimeException(message)

class ChatbotDiseaseNotFoundException(message: String) : RuntimeException(message)

class ChatbotInvalidDataException(message: String) : RuntimeException(message)