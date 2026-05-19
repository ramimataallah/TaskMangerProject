package com.example.demo.repository;

import com.example.demo.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * JPA repository for Category entity. Implementation provided by Spring Data.
 */
public interface CategoryRepository extends JpaRepository<Category, Long> {

}

