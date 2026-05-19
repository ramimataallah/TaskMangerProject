package com.example.demo;

 
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
 
/**
 * TaskManagerApplication - Entry point of the Spring Boot application.
 * Run this class to start the embedded Tomcat server on port 8080.
 */
@SpringBootApplication
public class TaskManagerApplication {
 
    public static void main(String[] args) {
        SpringApplication.run(TaskManagerApplication.class, args);
    }
}
