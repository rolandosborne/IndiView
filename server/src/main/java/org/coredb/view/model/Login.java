package org.coredb.view.model;

import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.validation.annotation.Validated;
import javax.validation.Valid;
import javax.validation.constraints.*;

/**
 * Login
 */
@Validated


public class Login   {
  @JsonProperty("appToken")
  private String appToken = null;

  @JsonProperty("nodeToken")
  private String nodeToken = null;

  @JsonProperty("serviceToken")
  private String serviceToken = null;

  @JsonProperty("serviceNode")
  private String serviceNode = null;

  public Login appToken(String appToken) {
    this.appToken = appToken;
    return this;
  }

  /**
   * Get appToken
   * @return appToken
   **/
  @Schema(required = true, description = "")
      @NotNull

    public String getAppToken() {
    return appToken;
  }

  public void setAppToken(String appToken) {
    this.appToken = appToken;
  }

  public Login nodeToken(String nodeToken) {
    this.nodeToken = nodeToken;
    return this;
  }

  /**
   * Get nodeToken
   * @return nodeToken
   **/
  @Schema(required = true, description = "")
      @NotNull

    public String getNodeToken() {
    return nodeToken;
  }

  public void setNodeToken(String nodeToken) {
    this.nodeToken = nodeToken;
  }

  public Login serviceToken(String serviceToken) {
    this.serviceToken = serviceToken;
    return this;
  }

  /**
   * Get serviceToken
   * @return serviceToken
   **/
  @Schema(required = true, description = "")
      @NotNull

    public String getServiceToken() {
    return serviceToken;
  }

  public void setServiceToken(String serviceToken) {
    this.serviceToken = serviceToken;
  }

  public Login serviceNode(String serviceNode) {
    this.serviceNode = serviceNode;
    return this;
  }

  /**
   * Get serviceNode
   * @return serviceNode
   **/
  @Schema(required = true, description = "")
      @NotNull

    public String getServiceNode() {
    return serviceNode;
  }

  public void setServiceNode(String serviceNode) {
    this.serviceNode = serviceNode;
  }


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    Login login = (Login) o;
    return Objects.equals(this.appToken, login.appToken) &&
        Objects.equals(this.nodeToken, login.nodeToken) &&
        Objects.equals(this.serviceToken, login.serviceToken) &&
        Objects.equals(this.serviceNode, login.serviceNode);
  }

  @Override
  public int hashCode() {
    return Objects.hash(appToken, nodeToken, serviceToken, serviceNode);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class Login {\n");
    
    sb.append("    appToken: ").append(toIndentedString(appToken)).append("\n");
    sb.append("    nodeToken: ").append(toIndentedString(nodeToken)).append("\n");
    sb.append("    serviceToken: ").append(toIndentedString(serviceToken)).append("\n");
    sb.append("    serviceNode: ").append(toIndentedString(serviceNode)).append("\n");
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
