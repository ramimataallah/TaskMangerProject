package com.example.demo.repository;

import com.example.demo.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * JPA repository for Task entity. Spring Data will provide the implementation at runtime.
 */
public interface TaskRepository extends JpaRepository<Task, Long> {

}
