package hoyjugas.DTO.MercadoPago;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
public class PaymentWebHookDTO {

    private String action;

    @JsonProperty("api_version")
    private String apiVersion;

    @JsonProperty("data")
    private PaymentWebHookDTOData data;

    @JsonProperty("date_created")
    private String dateCreated;

    private Long id;

    @JsonProperty("live_mode")
    private Boolean liveMode;

    private String type;

    @JsonProperty("user_id")
    private String userId;


    @Data
    public static class PaymentWebHookDTOData{
        @JsonProperty("id")
        private  String id;
    }

}