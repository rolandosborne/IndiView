package org.coredb.api;

import org.coredb.model.Emigo;
import org.coredb.model.EmigoLogin;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.constraints.*;
import javax.validation.Valid;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
public class AccountsApiController implements AccountsApi {

    private static final Logger log = LoggerFactory.getLogger(AccountsApiController.class);

    private final ObjectMapper objectMapper;

    private final HttpServletRequest request;

    @org.springframework.beans.factory.annotation.Autowired
    public AccountsApiController(ObjectMapper objectMapper, HttpServletRequest request) {
        this.objectMapper = objectMapper;
        this.request = request;
    }

    public ResponseEntity<EmigoLogin> attachAccount(@NotNull @Parameter(in = ParameterIn.QUERY, description = "id of emigo to be attached" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "emigoId", required = true) String emigoId,@NotNull @Parameter(in = ParameterIn.QUERY, description = "single use code" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "code", required = true) String code,@NotNull @Parameter(in = ParameterIn.QUERY, description = "node to forward request to" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "node", required = true) String node,@NotNull @Parameter(in = ParameterIn.QUERY, description = "request issued time" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "timestamp", required = true) Long timestamp) {
        String accept = request.getHeader("Accept");
        if (accept != null && accept.contains("application/json")) {
            try {
                return new ResponseEntity<EmigoLogin>(objectMapper.readValue("{\n  \"account\" : {\n    \"node\" : \"node\",\n    \"registry\" : \"registry\",\n    \"emigoId\" : \"emigoId\",\n    \"handle\" : \"handle\",\n    \"token\" : \"token\"\n  },\n  \"token\" : \"token\"\n}", EmigoLogin.class), HttpStatus.NOT_IMPLEMENTED);
            } catch (IOException e) {
                log.error("Couldn't serialize response for content type application/json", e);
                return new ResponseEntity<EmigoLogin>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

        return new ResponseEntity<EmigoLogin>(HttpStatus.NOT_IMPLEMENTED);
    }

    public ResponseEntity<Integer> getIdentityRevision(@NotNull @Parameter(in = ParameterIn.QUERY, description = "access token" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "token", required = true) String token) {
        String accept = request.getHeader("Accept");
        if (accept != null && accept.contains("application/json")) {
            try {
                return new ResponseEntity<Integer>(objectMapper.readValue("0", Integer.class), HttpStatus.NOT_IMPLEMENTED);
            } catch (IOException e) {
                log.error("Couldn't serialize response for content type application/json", e);
                return new ResponseEntity<Integer>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

        return new ResponseEntity<Integer>(HttpStatus.NOT_IMPLEMENTED);
    }

    public ResponseEntity<Emigo> updateHandle(@NotNull @Parameter(in = ParameterIn.QUERY, description = "login token" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "token", required = true) String token,@NotNull @Parameter(in = ParameterIn.QUERY, description = "registry base url" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "registry", required = true) String registry,@Parameter(in = ParameterIn.QUERY, description = "current revision" ,schema=@Schema()) @Valid @RequestParam(value = "revision", required = false) Integer revision) {
        String accept = request.getHeader("Accept");
        if (accept != null && accept.contains("application/json")) {
            try {
                return new ResponseEntity<Emigo>(objectMapper.readValue("{\n  \"node\" : \"https://node.coredb.org:9999/app\",\n  \"registry\" : \"https://registry.coredb.org:8888/app\",\n  \"name\" : \"name\",\n  \"emigoId\" : \"emigoId\",\n  \"description\" : \"description\",\n  \"logo\" : \"logo\",\n  \"location\" : \"location\",\n  \"handle\" : \"handle\",\n  \"version\" : \"version\",\n  \"revision\" : 0\n}", Emigo.class), HttpStatus.NOT_IMPLEMENTED);
            } catch (IOException e) {
                log.error("Couldn't serialize response for content type application/json", e);
                return new ResponseEntity<Emigo>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

        return new ResponseEntity<Emigo>(HttpStatus.NOT_IMPLEMENTED);
    }

}
