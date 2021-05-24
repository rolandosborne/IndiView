package org.coredb.api;

import java.math.BigDecimal;
import org.coredb.model.Contact;
import org.coredb.model.SearchArea;
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
public class SearchApiController implements SearchApi {

    private static final Logger log = LoggerFactory.getLogger(SearchApiController.class);

    private final ObjectMapper objectMapper;

    private final HttpServletRequest request;

    @org.springframework.beans.factory.annotation.Autowired
    public SearchApiController(ObjectMapper objectMapper, HttpServletRequest request) {
        this.objectMapper = objectMapper;
        this.request = request;
    }

    public ResponseEntity<List<Contact>> scanAccounts(@NotNull @Parameter(in = ParameterIn.QUERY, description = "login token" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "token", required = true) String token,@Parameter(in = ParameterIn.DEFAULT, description = "emigo to insert", required=true, schema=@Schema()) @Valid @RequestBody SearchArea body) {
        String accept = request.getHeader("Accept");
        if (accept != null && accept.contains("application/json")) {
            try {
                return new ResponseEntity<List<Contact>>(objectMapper.readValue("[ {\n  \"node\" : \"https://node.coredb.org:9999/app\",\n  \"registry\" : \"https://registry.coredb.org:8888/app\",\n  \"name\" : \"name\",\n  \"available\" : true,\n  \"emigoId\" : \"emigoId\",\n  \"description\" : \"description\",\n  \"logo\" : \"logo\",\n  \"location\" : \"location\",\n  \"handle\" : \"handle\",\n  \"version\" : \"version\",\n  \"revision\" : 0\n}, {\n  \"node\" : \"https://node.coredb.org:9999/app\",\n  \"registry\" : \"https://registry.coredb.org:8888/app\",\n  \"name\" : \"name\",\n  \"available\" : true,\n  \"emigoId\" : \"emigoId\",\n  \"description\" : \"description\",\n  \"logo\" : \"logo\",\n  \"location\" : \"location\",\n  \"handle\" : \"handle\",\n  \"version\" : \"version\",\n  \"revision\" : 0\n} ]", List.class), HttpStatus.NOT_IMPLEMENTED);
            } catch (IOException e) {
                log.error("Couldn't serialize response for content type application/json", e);
                return new ResponseEntity<List<Contact>>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

        return new ResponseEntity<List<Contact>>(HttpStatus.NOT_IMPLEMENTED);
    }

    public ResponseEntity<List<Contact>> searchAccounts(@NotNull @Parameter(in = ParameterIn.QUERY, description = "login token" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "token", required = true) String token,@NotNull  @DecimalMax("1024") @Parameter(in = ParameterIn.QUERY, description = "return max number of results" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "limit", required = true) BigDecimal limit,@Parameter(in = ParameterIn.QUERY, description = "or-set of matching name, handle, location, description" ,schema=@Schema()) @Valid @RequestParam(value = "match", required = false) String match,@Parameter(in = ParameterIn.QUERY, description = "filter with name like" ,schema=@Schema()) @Valid @RequestParam(value = "name", required = false) String name,@Parameter(in = ParameterIn.QUERY, description = "filter with handle like" ,schema=@Schema()) @Valid @RequestParam(value = "handle", required = false) String handle,@Parameter(in = ParameterIn.QUERY, description = "filter with description like" ,schema=@Schema()) @Valid @RequestParam(value = "description", required = false) String description,@Parameter(in = ParameterIn.QUERY, description = "filter with location like" ,schema=@Schema()) @Valid @RequestParam(value = "location", required = false) String location,@Parameter(in = ParameterIn.QUERY, description = "return results starting at offset" ,schema=@Schema()) @Valid @RequestParam(value = "offset", required = false) BigDecimal offset) {
        String accept = request.getHeader("Accept");
        if (accept != null && accept.contains("application/json")) {
            try {
                return new ResponseEntity<List<Contact>>(objectMapper.readValue("[ {\n  \"node\" : \"https://node.coredb.org:9999/app\",\n  \"registry\" : \"https://registry.coredb.org:8888/app\",\n  \"name\" : \"name\",\n  \"available\" : true,\n  \"emigoId\" : \"emigoId\",\n  \"description\" : \"description\",\n  \"logo\" : \"logo\",\n  \"location\" : \"location\",\n  \"handle\" : \"handle\",\n  \"version\" : \"version\",\n  \"revision\" : 0\n}, {\n  \"node\" : \"https://node.coredb.org:9999/app\",\n  \"registry\" : \"https://registry.coredb.org:8888/app\",\n  \"name\" : \"name\",\n  \"available\" : true,\n  \"emigoId\" : \"emigoId\",\n  \"description\" : \"description\",\n  \"logo\" : \"logo\",\n  \"location\" : \"location\",\n  \"handle\" : \"handle\",\n  \"version\" : \"version\",\n  \"revision\" : 0\n} ]", List.class), HttpStatus.NOT_IMPLEMENTED);
            } catch (IOException e) {
                log.error("Couldn't serialize response for content type application/json", e);
                return new ResponseEntity<List<Contact>>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

        return new ResponseEntity<List<Contact>>(HttpStatus.NOT_IMPLEMENTED);
    }

}
