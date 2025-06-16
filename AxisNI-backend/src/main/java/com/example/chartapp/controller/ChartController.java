package com.example.chartapp.controller;

import com.example.chartapp.model.Chart;
import com.example.chartapp.repository.ChartRepository;
import com.example.chartapp.service.FileParsingService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
@AllArgsConstructor
public class ChartController {

    private final FileParsingService fileParsingService;
    private final ChartRepository chartRepository;

    @PostMapping("/upload/excel")
    public ResponseEntity<?> uploadExcel(@RequestParam("file") MultipartFile file,
                                         @RequestParam("sheet") int sheet,
                                         @RequestParam("range") String range) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body("File must not be empty");
        }
        if (sheet < 0) {
            return ResponseEntity.badRequest().body("Sheet index must be non-negative");
        }
        if (range == null || range.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Range must not be empty");
        }

        try {
            List<Map<String, Object>> data = fileParsingService.parseExcelWithHeaders(file, sheet, range);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to parse Excel: " + e.getMessage());
        }
    }

    @PostMapping("/upload/csv")
    public ResponseEntity<?> uploadCsv(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body("CSV file must not be empty");
        }
        try {
            List<Map<String, Object>> data = fileParsingService.parseCsv(file);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to parse CSV: " + e.getMessage());
        }
    }

    @PostMapping("/upload/sheets")
    public ResponseEntity<?> getSheetNames(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body("File must not be empty");
        }
        try {
            List<String> sheets = fileParsingService.getSheetNames(file);
            return ResponseEntity.ok(Map.of("sheets", sheets));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to read sheet names: " + e.getMessage());
        }
    }

    @PostMapping("/chart/save")
    public ResponseEntity<?> saveChart(@RequestBody ChartDto chartDto) {
        if (chartDto.getName() == null || chartDto.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Chart name must not be empty");
        }
        if (chartDto.getConfigJson() == null || chartDto.getConfigJson().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Config JSON must not be empty");
        }

        Chart chart = Chart.builder()
                .name(chartDto.getName())
                .configJson(chartDto.getConfigJson())
                .build();

        chartRepository.save(chart);
        return ResponseEntity.ok(chart);
    }

    @GetMapping("/chart/all")
    public ResponseEntity<List<Chart>> getAllCharts() {
        List<Chart> charts = chartRepository.findAll();
        return ResponseEntity.ok(charts);
    }

    /**
     * Convert raw data to Highcharts config JSON.
     */
    @PostMapping("/chart/convert")
    public ResponseEntity<?> convertToHighcharts(@RequestBody List<Map<String, Object>> rawData) {
        if (rawData == null || rawData.isEmpty()) {
            return ResponseEntity.badRequest().body("Raw data must not be empty");
        }

        try {
            Map<String, Object> config = fileParsingService.convertToHighchartsConfig(rawData);
            return ResponseEntity.ok(config);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to convert data: " + e.getMessage());
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    private static class ChartDto {
        private String name;
        private String configJson;
    }
}
