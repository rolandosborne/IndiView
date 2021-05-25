package org.coredb.model;

import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.validation.annotation.Validated;
import javax.validation.Valid;
import javax.validation.constraints.*;

/**
 * Params
 */
@Validated


public class Params   {
  @JsonProperty("serviceNode")
  private String serviceNode = null;

  @JsonProperty("serviceToken")
  private String serviceToken = null;

  public Params serviceNode(String serviceNode) {
    this.serviceNode = serviceNode;
    return this;
  }

  /**
   * Get serviceNode
   * @return serviceNode
   **/
  @Schema(description = "")
  
    public String getServiceNode() {
    return serviceNode;
  }

  public void setServiceNode(String serviceNode) {
    this.serviceNode = serviceNode;
  }

  public Params serviceToken(String serviceToken) {
    this.serviceToken = serviceToken;
    return this;
  }

  /**
   * Get serviceToken
   * @return serviceToken
   **/
  @Schema(description = "")
  
    public String getServiceToken() {
    return serviceToken;
  }

  public void setServiceToken(String serviceToken) {
    this.serviceToken = serviceToken;
  }


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    Params params = (Params) o;
    return Objects.equals(this.serviceNode, params.serviceNode) &&
        Objects.equals(this.serviceToken, params.serviceToken);
  }

  @Override
  public int hashCode() {
    return Objects.hash(serviceNode, serviceToken);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class Params {\n");
    
    sb.append("    serviceNode: ").append(toIndentedString(serviceNode)).append("\n");
    sb.append("    serviceToken: ").append(toIndentedString(serviceToken)).append("\n");
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
