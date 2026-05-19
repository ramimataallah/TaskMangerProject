package com.example.demo.service;

import com.example.demo.model.Task;
import com.example.demo.repository.TaskRepository;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.model.Category;
import org.springframework.stereotype.Service;
 
import java.util.List;
import java.util.Optional;
 
/**
 * TaskService - Business logic layer.
 * Sits between the Controller and Repository.
 */
@Service
public class TaskService {
 
    private final TaskRepository taskRepository;
    private final CategoryRepository categoryRepository;
 
    // Constructor injection (best practice over @Autowired on field)
    public TaskService(TaskRepository taskRepository, CategoryRepository categoryRepository) {
        this.taskRepository = taskRepository;
        this.categoryRepository = categoryRepository;
    }
 
    // ─── Get All Tasks ─────────────────────────────────────────────────────────
 
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }
 
    // ─── Get Task By ID ────────────────────────────────────────────────────────
 
    public Optional<Task> getTaskById(Long id) {
        return taskRepository.findById(id);
    }
 
    // ─── Create Task ───────────────────────────────────────────────────────────
 
    public Task createTask(Task task) {
        task.setCompleted(false); // new tasks are always incomplete
        if (task.getCategory() != null && task.getCategory().getId() != null) {
            Long catId = task.getCategory().getId();
            Category cat = categoryRepository.findById(catId).orElse(null);
            task.setCategory(cat);
        }
        return taskRepository.save(task);
    }
 
    // ─── Update Task ───────────────────────────────────────────────────────────
 
    public Optional<Task> updateTask(Long id, Task updatedTask) {
        return taskRepository.findById(id).map(existing -> {
            existing.setTitle(updatedTask.getTitle());
            existing.setDescription(updatedTask.getDescription());
            existing.setCompleted(updatedTask.isCompleted());
            existing.setDueDate(updatedTask.getDueDate());
            if (updatedTask.getCategory() != null && updatedTask.getCategory().getId() != null) {
                Category cat = categoryRepository.findById(updatedTask.getCategory().getId()).orElse(null);
                existing.setCategory(cat);
            } else {
                existing.setCategory(null);
            }
            return taskRepository.save(existing);
        });
    }
 
    // ─── Delete Task ───────────────────────────────────────────────────────────
 
    public boolean deleteTask(Long id) {
        if (taskRepository.existsById(id)) {
            taskRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
