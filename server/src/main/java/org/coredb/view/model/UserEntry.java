package org.coredb.view.model;

import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import org.springframework.validation.annotation.Validated;
import javax.validation.Valid;
import javax.validation.constraints.*;

/**
 * UserEntry
 */
@Validated


public class UserEntry   {
  @JsonProperty("amigoId")
  private String amigoId = null;

  @JsonProperty("accountToken")
  private String accountToken = null;

  @JsonProperty("serviceToken")
  private String serviceToken = null;

  public UserEntry amigoId(String amigoId) {
    this.amigoId = amigoId;
    return this;
  }

  /**
   * Get amigoId
   * @return amigoId
  **/
  @ApiModelProperty(required = true, value = "")
      @NotNull

    public String getAmigoId() {
    return amigoId;
  }

  public void setAmigoId(String amigoId) {
    this.amigoId = amigoId;
  }

  public UserEntry accountToken(String accountToken) {
    this.accountToken = accountToken;
    return this;
  }

  /**
   * Get accountToken
   * @return accountToken
  **/
  @ApiModelProperty(required = true, value = "")
      @NotNull

    public String getAccountToken() {
    return accountToken;
  }

  public void setAccountToken(String accountToken) {
    this.accountToken = accountToken;
  }

  public UserEntry serviceToken(String serviceToken) {
    this.serviceToken = serviceToken;
    return this;
  }

  /**
   * Get serviceToken
   * @return serviceToken
  **/
  @ApiModelProperty(required = true, value = "")
      @NotNull

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
    UserEntry userEntry = (UserEntry) o;
    return Objects.equals(this.amigoId, userEntry.amigoId) &&
        Objects.equals(this.accountToken, userEntry.accountToken) &&
        Objects.equals(this.serviceToken, userEntry.serviceToken);
  }

  @Override
  public int hashCode() {
    return Objects.hash(amigoId, accountToken, serviceToken);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class UserEntry {\n");
    
    sb.append("    amigoId: ").append(toIndentedString(amigoId)).append("\n");
    sb.append("    accountToken: ").append(toIndentedString(accountToken)).append("\n");
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


