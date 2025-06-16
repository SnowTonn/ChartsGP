package com.example.chartapp.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.LinkedHashMap;

import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

@Service
public class ExcelService {

    public List<Map<String, Object>> parseExcel(MultipartFile file, int sheetIndex, String range) throws IOException {
        List<Map<String, Object>> result = new ArrayList<>();

        // Open workbook from the MultipartFile input stream
        Workbook workbook = new XSSFWorkbook(file.getInputStream());

        // Get the sheet by index
        Sheet sheet = workbook.getSheetAt(sheetIndex);

        // Parse the cell range (e.g. "A1:C10") into numeric row/column bounds
        CellRangeAddress rangeAddress = CellRangeAddress.valueOf(range);

        // Iterate over rows and columns within the range
        for (int rowIndex = rangeAddress.getFirstRow(); rowIndex <= rangeAddress.getLastRow(); rowIndex++) {
            Row row = sheet.getRow(rowIndex);
            if (row == null) continue;

            Map<String, Object> rowMap = new LinkedHashMap<>();

            for (int colIndex = rangeAddress.getFirstColumn(); colIndex <= rangeAddress.getLastColumn(); colIndex++) {
                Cell cell = row.getCell(colIndex);
                rowMap.put("col" + (colIndex - rangeAddress.getFirstColumn()), getCellValue(cell));
            }

            result.add(rowMap);
        }

        workbook.close();
        return result;
    }

    private Object getCellValue(Cell cell) {
        if (cell == null) return "";

        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (org.apache.poi.ss.usermodel.DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue();
                } else {
                    return cell.getNumericCellValue();
                }
            case BOOLEAN:
                return cell.getBooleanCellValue();
            case FORMULA:
                // Evaluate formula result as string (you could expand this to evaluate to numeric, etc.)
                try {
                    return cell.getStringCellValue();
                } catch (IllegalStateException e) {
                    return cell.getNumericCellValue();
                }
            case BLANK:
            default:
                return "";
        }
    }
}
