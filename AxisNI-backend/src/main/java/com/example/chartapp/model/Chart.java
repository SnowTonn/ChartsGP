package com.example.chartapp.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "charts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Chart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(columnDefinition = "TEXT")
    private String configJson;
}
