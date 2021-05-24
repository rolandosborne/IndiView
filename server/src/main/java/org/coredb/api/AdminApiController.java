package org.coredb.api;

import org.coredb.model.SystemStat;
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
public class AdminApiController implements AdminApi {

    private static final Logger log = LoggerFactory.getLogger(AdminApiController.class);

    private final ObjectMapper objectMapper;

    private final HttpServletRequest request;

    @org.springframework.beans.factory.annotation.Autowired
    public AdminApiController(ObjectMapper objectMapper, HttpServletRequest request) {
        this.objectMapper = objectMapper;
        this.request = request;
    }

    public ResponseEntity<Void> adminServerStat(@NotNull @Min(0) @Max(100) @Parameter(in = ParameterIn.QUERY, description = "time" ,required=true,schema=@Schema(allowableValues={  }, maximum="100"
)) @Valid @RequestParam(value = "processor", required = true) Integer processor,@NotNull @Parameter(in = ParameterIn.QUERY, description = "current memory free" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "memory", required = true) Long memory,@NotNull @Parameter(in = ParameterIn.QUERY, description = "current storage free" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "storage", required = true) Long storage,@Parameter(in = ParameterIn.QUERY, description = "access token" ,schema=@Schema()) @Valid @RequestParam(value = "token", required = false) String token) {
        String accept = request.getHeader("Accept");
        return new ResponseEntity<Void>(HttpStatus.NOT_IMPLEMENTED);
    }

    public ResponseEntity<List<SystemStat>> adminServerStats(@NotNull @Parameter(in = ParameterIn.QUERY, description = "access token" ,required=true,schema=@Schema()) @Valid @RequestParam(value = "token", required = true) String token,@Parameter(in = ParameterIn.QUERY, description = "offset into record set" ,schema=@Schema()) @Valid @RequestParam(value = "offset", required = false) Integer offset,@Parameter(in = ParameterIn.QUERY, description = "max size of record set" ,schema=@Schema()) @Valid @RequestParam(value = "limit", required = false) Integer limit) {
        String accept = request.getHeader("Accept");
        if (accept != null && accept.contains("application/json")) {
            try {
                return new ResponseEntity<List<SystemStat>>(objectMapper.readValue("[ {\n  \"memory\" : 1,\n  \"storage\" : 5,\n  \"requests\" : 5,\n  \"accounts\" : 2,\n  \"processor\" : 6,\n  \"timestamp\" : 0\n}, {\n  \"memory\" : 1,\n  \"storage\" : 5,\n  \"requests\" : 5,\n  \"accounts\" : 2,\n  \"processor\" : 6,\n  \"timestamp\" : 0\n} ]", List.class), HttpStatus.NOT_IMPLEMENTED);
            } catch (IOException e) {
                log.error("Couldn't serialize response for content type application/json", e);
                return new ResponseEntity<List<SystemStat>>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

        return new ResponseEntity<List<SystemStat>>(HttpStatus.NOT_IMPLEMENTED);
    }

}
