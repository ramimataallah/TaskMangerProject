package com.example.demo.controller;

import com.example.demo.model.Task;
import com.example.demo.service.TaskService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
 
import java.util.List;
 
/**
 * TaskController - REST API layer.
 * Exposes endpoints at /api/tasks
 * @CrossOrigin allows the HTML frontend to call this API from any origin.
 */
@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskController {
 
    private final TaskService taskService;
 
    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }
 
    // ─── GET /api/tasks ────────────────────────────────────────────────────────
    // Returns all tasks
 
    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }
 
    // ─── GET /api/tasks/{id} ───────────────────────────────────────────────────
    // Returns one task by ID, or 404 if not found
 
    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long id) {
        return taskService.getTaskById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
 
    // ─── POST /api/tasks ───────────────────────────────────────────────────────
    // Creates a new task; returns 201 Created
 
    @PostMapping
    public ResponseEntity<Task> createTask(@RequestBody Task task) {
        Task created = taskService.createTask(task);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
 
    // ─── PUT /api/tasks/{id} ───────────────────────────────────────────────────
    // Updates existing task; returns 200 OK or 404 Not Found
 
    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id,
                                           @RequestBody Task updatedTask) {
        return taskService.updateTask(id, updatedTask)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
 
    // ─── DELETE /api/tasks/{id} ────────────────────────────────────────────────
    // Deletes a task; returns 204 No Content or 404 Not Found
 
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        if (taskService.deleteTask(id)) {
            return ResponseEntity.noContent().build();   // 204
        }
        return ResponseEntity.notFound().build();         // 404
    }
}