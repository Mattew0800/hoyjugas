package hoyjugas.DTO.Product;

import lombok.Data;

@Data
public class ProductFilterDTO {
    private Long categoryId;
    private Long supplierId;
    private String search;
    private Boolean lowStock;
    private Boolean isActive;
    private int page = 0;
    private int size = 20;
    private String sortBy = "name";
    private String sortDirection = "asc";
}