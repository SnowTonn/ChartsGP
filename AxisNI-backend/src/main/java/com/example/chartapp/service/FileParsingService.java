package com.example.chartapp.service;

import com.opencsv.CSVReader;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FileParsingService {

    /**
     * Parses Excel file with header row used for keys.
     */
    public List<Map<String, Object>> parseExcelWithHeaders(MultipartFile file, int sheetIndex, String range) throws Exception {
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(sheetIndex);
            CellRangeAddress rangeAddress = CellRangeAddress.valueOf(range);

            FormulaEvaluator evaluator = workbook.getCreationHelper().createFormulaEvaluator();

            List<Map<String, Object>> data = new ArrayList<>();

            // Read header row first
            Row headerRow = sheet.getRow(rangeAddress.getFirstRow());
            if (headerRow == null) {
                throw new IllegalArgumentException("Header row is missing");
            }

            List<String> headers = new ArrayList<>();
            for (int c = rangeAddress.getFirstColumn(); c <= rangeAddress.getLastColumn(); c++) {
                Cell cell = headerRow.getCell(c);
                headers.add(cell != null ? cell.getStringCellValue() : "Column" + (c - rangeAddress.getFirstColumn()));
            }

            // Read data rows after header
            for (int r = rangeAddress.getFirstRow() + 1; r <= rangeAddress.getLastRow(); r++) {
                Row row = sheet.getRow(r);
                if (row == null) continue;

                Map<String, Object> rowMap = new LinkedHashMap<>();
                for (int c = rangeAddress.getFirstColumn(); c <= rangeAddress.getLastColumn(); c++) {
                    Cell cell = row.getCell(c);
                    Object value = getCellValue(cell, evaluator);
                    rowMap.put(headers.get(c - rangeAddress.getFirstColumn()), value);
                }
                data.add(rowMap);
            }

            return data;
        }
    }


    /**
     * Parses CSV file into list of maps keyed by headers.
     */
    public List<Map<String, Object>> parseCsv(MultipartFile file) throws Exception {
        List<Map<String, Object>> data = new ArrayList<>();
        try (CSVReader csvReader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            String[] headers = csvReader.readNext();
            if (headers == null) return data;

            String[] values;
            while ((values = csvReader.readNext()) != null) {
                Map<String, Object> row = new LinkedHashMap<>();
                for (int i = 0; i < headers.length; i++) {
                    row.put(headers[i], i < values.length ? values[i] : "");
                }
                data.add(row);
            }
        }
        return data;
    }

    /**
     * Returns sheet names from Excel file.
     */
    public List<String> getSheetNames(MultipartFile file) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            List<String> sheetNames = new ArrayList<>();
            for (int i = 0; i < workbook.getNumberOfSheets(); i++) {
                sheetNames.add(workbook.getSheetName(i));
            }
            return sheetNames;
        }
    }

    private Object getCellValue(Cell cell, FormulaEvaluator evaluator) {
        if (cell == null) return "";

        Object value = null;

        switch (cell.getCellType()) {
            case STRING:
                value = cell.getStringCellValue();
                break;
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    value = cell.getDateCellValue();
                } else {
                    value = cell.getNumericCellValue();
                }
                break;
            case BOOLEAN:
                value = cell.getBooleanCellValue();
                break;
            case FORMULA:
                CellValue evaluatedValue = evaluator.evaluate(cell);
                if (evaluatedValue == null) return "";
                switch (evaluatedValue.getCellType()) {
                    case BOOLEAN:
                        value = evaluatedValue.getBooleanValue();
                        break;
                    case NUMERIC:
                        value = evaluatedValue.getNumberValue();
                        break;
                    case STRING:
                        value = evaluatedValue.getStringValue();
                        break;
                    case BLANK:
                        value = "";
                        break;
                    case ERROR:
                        value = "ERROR";
                        break;
                    default:
                        value = "";
                        break;
                }
                break;
            case BLANK:
                value = "";
                break;
            default:
                value = "";
        }

        // Check if cell is formatted as percentage, multiply value by 100 if numeric
        CellStyle style = cell.getCellStyle();
        String format = style.getDataFormatString();
        if (format != null && format.contains("%") && value instanceof Number) {
            double numericValue = ((Number) value).doubleValue();
            value = numericValue * 100;
        }

        return value;
    }



    /**
     * Converts raw data into Highcharts config JSON structure.
     */
    public Map<String, Object> convertToHighchartsConfig(List<Map<String, Object>> rawData) {
        if (rawData == null || rawData.isEmpty()) {
            return Map.of("categories", List.of(), "series", List.of());
        }

        Map<String, Object> firstRow = rawData.get(0);
        List<String> keys = new ArrayList<>(firstRow.keySet());

        String categoryKey = keys.get(0);
        keys.remove(0);

        List<String> categories = rawData.stream()
                .map(row -> String.valueOf(row.get(categoryKey)))
                .collect(Collectors.toList());

        List<Map<String, Object>> series = new ArrayList<>();

        for (String key : keys) {
            List<Number> data = rawData.stream()
                    .map(row -> {
                        Object val = row.get(key);
                        if (val instanceof Number) {
                            return (Number) val;
                        }
                        try {
                            return Double.parseDouble(String.valueOf(val));
                        } catch (Exception e) {
                            return 0;
                        }
                    })
                    .collect(Collectors.toList());

            Map<String, Object> serie = Map.of(
                    "name", key,
                    "data", data
            );

            series.add(serie);
        }

        return Map.of(
                "categories", categories,
                "series", series
        );
    }
}
