package org.coredb.model;

import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import io.swagger.v3.oas.annotations.media.Schema;
import org.coredb.model.ServiceAccess;
import org.springframework.validation.annotation.Validated;
import javax.validation.Valid;
import javax.validation.constraints.*;

/**
 * CreateLink
 */
@Validated


public class CreateLink   {
  @JsonProperty("access")
  private ServiceAccess access = null;

  @JsonProperty("expires")
  private Long expires = null;

  @JsonProperty("issued")
  private Long issued = null;

  public CreateLink access(ServiceAccess access) {
    this.access = access;
    return this;
  }

  /**
   * Get access
   * @return access
   **/
  @Schema(required = true, description = "")
      @NotNull

    @Valid
    public ServiceAccess getAccess() {
    return access;
  }

  public void setAccess(ServiceAccess access) {
    this.access = access;
  }

  public CreateLink expires(Long expires) {
    this.expires = expires;
    return this;
  }

  /**
   * Get expires
   * @return expires
   **/
  @Schema(required = true, description = "")
      @NotNull

    public Long getExpires() {
    return expires;
  }

  public void setExpires(Long expires) {
    this.expires = expires;
  }

  public CreateLink issued(Long issued) {
    this.issued = issued;
    return this;
  }

  /**
   * Get issued
   * @return issued
   **/
  @Schema(required = true, description = "")
      @NotNull

    public Long getIssued() {
    return issued;
  }

  public void setIssued(Long issued) {
    this.issued = issued;
  }


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    CreateLink createLink = (CreateLink) o;
    return Objects.equals(this.access, createLink.access) &&
        Objects.equals(this.expires, createLink.expires) &&
        Objects.equals(this.issued, createLink.issued);
  }

  @Override
  public int hashCode() {
    return Objects.hash(access, expires, issued);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class CreateLink {\n");
    
    sb.append("    access: ").append(toIndentedString(access)).append("\n");
    sb.append("    expires: ").append(toIndentedString(expires)).append("\n");
    sb.append("    issued: ").append(toIndentedString(issued)).append("\n");
    sb.append("}");
    return sb.toString();
  }

  /**
   * Convert the given object to string with each line indented by 4 spaces
   * (except the first line).
   */
  private String toIndentedString(java.lang.Object o) {
    if (o == null) {
      return "null";
    }
    return o.toString().replace("\n", "\n    ");
  }
}
