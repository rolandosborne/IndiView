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
  @JsonProperty("amigoId")
  private String amigoId = null;

  @JsonProperty("appToken")
  private String appToken = null;

  @JsonProperty("accountToken")
  private String accountToken = null;

  @JsonProperty("accountNode")
  private String accountNode = null;

  @JsonProperty("serviceToken")
  private String serviceToken = null;

  @JsonProperty("serviceNode")
  private String serviceNode = null;

  public Login amigoId(String amigoId) {
    this.amigoId = amigoId;
    return this;
  }

  /**
   * Get amigoId
   * @return amigoId
   **/
  @Schema(required = true, description = "")
      @NotNull

    public String getAmigoId() {
    return amigoId;
  }

  public void setAmigoId(String amigoId) {
    this.amigoId = amigoId;
  }

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

  public Login accountToken(String accountToken) {
    this.accountToken = accountToken;
    return this;
  }

  /**
   * Get accountToken
   * @return accountToken
   **/
  @Schema(required = true, description = "")
      @NotNull

    public String getAccountToken() {
    return accountToken;
  }

  public void setAccountToken(String accountToken) {
    this.accountToken = accountToken;
  }

  public Login accountNode(String accountNode) {
    this.accountNode = accountNode;
    return this;
  }

  /**
   * Get accountNode
   * @return accountNode
   **/
  @Schema(required = true, description = "")
      @NotNull

    public String getAccountNode() {
    return accountNode;
  }

  public void setAccountNode(String accountNode) {
    this.accountNode = accountNode;
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
    return Objects.equals(this.amigoId, login.amigoId) &&
        Objects.equals(this.appToken, login.appToken) &&
        Objects.equals(this.accountToken, login.accountToken) &&
        Objects.equals(this.accountNode, login.accountNode) &&
        Objects.equals(this.serviceToken, login.serviceToken) &&
        Objects.equals(this.serviceNode, login.serviceNode);
  }

  @Override
  public int hashCode() {
    return Objects.hash(amigoId, appToken, accountToken, accountNode, serviceToken, serviceNode);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class Login {\n");
    
    sb.append("    amigoId: ").append(toIndentedString(amigoId)).append("\n");
    sb.append("    appToken: ").append(toIndentedString(appToken)).append("\n");
    sb.append("    accountToken: ").append(toIndentedString(accountToken)).append("\n");
    sb.append("    accountNode: ").append(toIndentedString(accountNode)).append("\n");
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

