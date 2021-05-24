package org.coredb.model;

import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.validation.annotation.Validated;
import javax.validation.Valid;
import javax.validation.constraints.*;

/**
 * AppConfig
 */
@Validated


public class AppConfig   {
  @JsonProperty("consoleToken")
  private String consoleToken = null;

  @JsonProperty("appNode")
  private String appNode = null;

  @JsonProperty("appToken")
  private String appToken = null;

  @JsonProperty("statToken")
  private String statToken = null;

  public AppConfig consoleToken(String consoleToken) {
    this.consoleToken = consoleToken;
    return this;
  }

  /**
   * Get consoleToken
   * @return consoleToken
   **/
  @Schema(description = "")
  
    public String getConsoleToken() {
    return consoleToken;
  }

  public void setConsoleToken(String consoleToken) {
    this.consoleToken = consoleToken;
  }

  public AppConfig appNode(String appNode) {
    this.appNode = appNode;
    return this;
  }

  /**
   * Get appNode
   * @return appNode
   **/
  @Schema(description = "")
  
    public String getAppNode() {
    return appNode;
  }

  public void setAppNode(String appNode) {
    this.appNode = appNode;
  }

  public AppConfig appToken(String appToken) {
    this.appToken = appToken;
    return this;
  }

  /**
   * Get appToken
   * @return appToken
   **/
  @Schema(description = "")
  
    public String getAppToken() {
    return appToken;
  }

  public void setAppToken(String appToken) {
    this.appToken = appToken;
  }

  public AppConfig statToken(String statToken) {
    this.statToken = statToken;
    return this;
  }

  /**
   * Get statToken
   * @return statToken
   **/
  @Schema(description = "")
  
    public String getStatToken() {
    return statToken;
  }

  public void setStatToken(String statToken) {
    this.statToken = statToken;
  }


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    AppConfig appConfig = (AppConfig) o;
    return Objects.equals(this.consoleToken, appConfig.consoleToken) &&
        Objects.equals(this.appNode, appConfig.appNode) &&
        Objects.equals(this.appToken, appConfig.appToken) &&
        Objects.equals(this.statToken, appConfig.statToken);
  }

  @Override
  public int hashCode() {
    return Objects.hash(consoleToken, appNode, appToken, statToken);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class AppConfig {\n");
    
    sb.append("    consoleToken: ").append(toIndentedString(consoleToken)).append("\n");
    sb.append("    appNode: ").append(toIndentedString(appNode)).append("\n");
    sb.append("    appToken: ").append(toIndentedString(appToken)).append("\n");
    sb.append("    statToken: ").append(toIndentedString(statToken)).append("\n");
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
