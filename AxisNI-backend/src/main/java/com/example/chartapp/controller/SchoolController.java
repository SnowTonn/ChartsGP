package com.example.chartapp.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.core.io.ClassPathResource;
import com.opencsv.CSVReader;

import java.io.InputStreamReader;
import java.util.*;

@RestController
@RequestMapping("/api/schools")
public class SchoolController {

    @GetMapping
    public List<Map<String, String>> getSchools(
        @RequestParam(defaultValue = "All") String type,
        @RequestParam(defaultValue = "All") String city,
        @RequestParam(defaultValue = "") String name,
        @RequestParam(defaultValue = "2000") String pupilsMaxStr,
        @RequestParam(defaultValue = "100") String grade5MaxStr,
        @RequestParam(defaultValue = "1") String rankMinStr,
        @RequestParam(defaultValue = "100") String rankMaxStr
    ) {
        // Sanitize and parse integer parameters safely
        int pupilsMax = safeParseInt(pupilsMaxStr, 2000);
        int grade5Max = safeParseInt(grade5MaxStr, 100);
        int rankMin = safeParseInt(rankMinStr, 1);
        int rankMax = safeParseInt(rankMaxStr, 100);

        List<Map<String, String>> schools = new ArrayList<>();

        try {
            var file = new ClassPathResource("data/DataSchools10.csv");
            try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
                String[] headers = reader.readNext(); // First line
                String[] line;

                while ((line = reader.readNext()) != null) {
                    Map<String, String> row = new HashMap<>();
                    for (int i = 0; i < headers.length; i++) {
                        row.put(headers[i], i < line.length ? line[i] : "");
                    }

                    if (!row.containsKey("Latitude") || !row.containsKey("Longitude")) continue;
                    if (row.get("Latitude").isEmpty() || row.get("Longitude").isEmpty()) continue;

                    int rank = safeInt(row.get("Rank"), 0);
                    int pupils = safeInt(row.get("Pupils KS4"), 0);
                    double grade5 = safeDouble(row.get("Grade 5+ English & Maths (%)"), 0);

                    boolean matches = (type.equals("All") || row.get("Type").equalsIgnoreCase(type)) &&
                                      (city.equals("All") || row.get("City").equalsIgnoreCase(city)) &&
                                      (row.get("School Name").toLowerCase().contains(name.toLowerCase())) &&
                                      (pupils <= pupilsMax) &&
                                      (grade5 <= grade5Max) &&
                                      (rank >= rankMin && rank <= rankMax);

                    if (matches) {
                        Map<String, String> schoolData = new HashMap<>();
                        schoolData.put("rank", row.get("Rank"));
                        schoolData.put("name", row.get("School Name"));
                        schoolData.put("type", row.get("Type"));
                        schoolData.put("city", row.get("City"));
                        schoolData.put("address", row.get("Address"));
                        schoolData.put("pupilsKS4", row.get("Pupils KS4"));
                        schoolData.put("pupilsMeasured", row.get("Pupils Measured"));
                        schoolData.put("progress8Score", row.get("Progress 8 Score"));
                        schoolData.put("progress8Description", row.get("Progress 8 Description"));
                        schoolData.put("enteringEBacc", row.get("Entering EBacc"));
                        schoolData.put("stayingInEducation", row.get("Staying in Education/Employment"));
                        schoolData.put("grade5Plus", row.get("Grade 5+ English & Maths (%)"));
                        schoolData.put("attainment8", row.get("Attainment 8"));
                        schoolData.put("ebaccScore", row.get("EBacc Avg Point Score"));
                        schoolData.put("lat", row.get("Latitude"));
                        schoolData.put("lng", row.get("Longitude"));

                        schools.add(schoolData);
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return schools;
    }

    private int safeInt(String s, int fallback) {
        try {
            return Integer.parseInt(s);
        } catch (Exception e) {
            return fallback;
        }
    }

    private double safeDouble(String s, double fallback) {
        try {
            return Double.parseDouble(s);
        } catch (Exception e) {
            return fallback;
        }
    }

    private int safeParseInt(String s, int fallback) {
        if (s == null || s.isEmpty()) return fallback;
        s = s.trim().replaceAll("\\.$", ""); // remove trailing dot if any
        try {
            return Integer.parseInt(s);
        } catch (NumberFormatException e) {
            return fallback;
        }
    }
}
