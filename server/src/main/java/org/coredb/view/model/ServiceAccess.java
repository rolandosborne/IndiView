package org.coredb.view.model;

import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.validation.annotation.Validated;
import javax.validation.Valid;
import javax.validation.constraints.*;

/**
 * ServiceAccess
 */
@Validated


public class ServiceAccess   {
  @JsonProperty("enableShow")
  private Boolean enableShow = null;

  @JsonProperty("enableIdentity")
  private Boolean enableIdentity = null;

  @JsonProperty("enableProfile")
  private Boolean enableProfile = null;

  @JsonProperty("enableGroup")
  private Boolean enableGroup = null;

  @JsonProperty("enableShare")
  private Boolean enableShare = null;

  @JsonProperty("enablePrompt")
  private Boolean enablePrompt = null;

  @JsonProperty("enableService")
  private Boolean enableService = null;

  @JsonProperty("enableIndex")
  private Boolean enableIndex = null;

  @JsonProperty("enableUser")
  private Boolean enableUser = null;

  @JsonProperty("enableAccess")
  private Boolean enableAccess = null;

  @JsonProperty("enableAccount")
  private Boolean enableAccount = null;

  @JsonProperty("enableConversation")
  private Boolean enableConversation = null;

  public ServiceAccess enableShow(Boolean enableShow) {
    this.enableShow = enableShow;
    return this;
  }

  /**
   * Get enableShow
   * @return enableShow
   **/
  @Schema(description = "")
  
    public Boolean isEnableShow() {
    return enableShow;
  }

  public void setEnableShow(Boolean enableShow) {
    this.enableShow = enableShow;
  }

  public ServiceAccess enableIdentity(Boolean enableIdentity) {
    this.enableIdentity = enableIdentity;
    return this;
  }

  /**
   * Get enableIdentity
   * @return enableIdentity
   **/
  @Schema(description = "")
  
    public Boolean isEnableIdentity() {
    return enableIdentity;
  }

  public void setEnableIdentity(Boolean enableIdentity) {
    this.enableIdentity = enableIdentity;
  }

  public ServiceAccess enableProfile(Boolean enableProfile) {
    this.enableProfile = enableProfile;
    return this;
  }

  /**
   * Get enableProfile
   * @return enableProfile
   **/
  @Schema(description = "")
  
    public Boolean isEnableProfile() {
    return enableProfile;
  }

  public void setEnableProfile(Boolean enableProfile) {
    this.enableProfile = enableProfile;
  }

  public ServiceAccess enableGroup(Boolean enableGroup) {
    this.enableGroup = enableGroup;
    return this;
  }

  /**
   * Get enableGroup
   * @return enableGroup
   **/
  @Schema(description = "")
  
    public Boolean isEnableGroup() {
    return enableGroup;
  }

  public void setEnableGroup(Boolean enableGroup) {
    this.enableGroup = enableGroup;
  }

  public ServiceAccess enableShare(Boolean enableShare) {
    this.enableShare = enableShare;
    return this;
  }

  /**
   * Get enableShare
   * @return enableShare
   **/
  @Schema(description = "")
  
    public Boolean isEnableShare() {
    return enableShare;
  }

  public void setEnableShare(Boolean enableShare) {
    this.enableShare = enableShare;
  }

  public ServiceAccess enablePrompt(Boolean enablePrompt) {
    this.enablePrompt = enablePrompt;
    return this;
  }

  /**
   * Get enablePrompt
   * @return enablePrompt
   **/
  @Schema(description = "")
  
    public Boolean isEnablePrompt() {
    return enablePrompt;
  }

  public void setEnablePrompt(Boolean enablePrompt) {
    this.enablePrompt = enablePrompt;
  }

  public ServiceAccess enableService(Boolean enableService) {
    this.enableService = enableService;
    return this;
  }

  /**
   * Get enableService
   * @return enableService
   **/
  @Schema(description = "")
  
    public Boolean isEnableService() {
    return enableService;
  }

  public void setEnableService(Boolean enableService) {
    this.enableService = enableService;
  }

  public ServiceAccess enableIndex(Boolean enableIndex) {
    this.enableIndex = enableIndex;
    return this;
  }

  /**
   * Get enableIndex
   * @return enableIndex
   **/
  @Schema(description = "")
  
    public Boolean isEnableIndex() {
    return enableIndex;
  }

  public void setEnableIndex(Boolean enableIndex) {
    this.enableIndex = enableIndex;
  }

  public ServiceAccess enableUser(Boolean enableUser) {
    this.enableUser = enableUser;
    return this;
  }

  /**
   * Get enableUser
   * @return enableUser
   **/
  @Schema(description = "")
  
    public Boolean isEnableUser() {
    return enableUser;
  }

  public void setEnableUser(Boolean enableUser) {
    this.enableUser = enableUser;
  }

  public ServiceAccess enableAccess(Boolean enableAccess) {
    this.enableAccess = enableAccess;
    return this;
  }

  /**
   * Get enableAccess
   * @return enableAccess
   **/
  @Schema(description = "")
  
    public Boolean isEnableAccess() {
    return enableAccess;
  }

  public void setEnableAccess(Boolean enableAccess) {
    this.enableAccess = enableAccess;
  }

  public ServiceAccess enableAccount(Boolean enableAccount) {
    this.enableAccount = enableAccount;
    return this;
  }

  /**
   * Get enableAccount
   * @return enableAccount
   **/
  @Schema(description = "")
  
    public Boolean isEnableAccount() {
    return enableAccount;
  }

  public void setEnableAccount(Boolean enableAccount) {
    this.enableAccount = enableAccount;
  }

  public ServiceAccess enableConversation(Boolean enableConversation) {
    this.enableConversation = enableConversation;
    return this;
  }

  /**
   * Get enableConversation
   * @return enableConversation
   **/
  @Schema(description = "")
  
    public Boolean isEnableConversation() {
    return enableConversation;
  }

  public void setEnableConversation(Boolean enableConversation) {
    this.enableConversation = enableConversation;
  }


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    ServiceAccess serviceAccess = (ServiceAccess) o;
    return Objects.equals(this.enableShow, serviceAccess.enableShow) &&
        Objects.equals(this.enableIdentity, serviceAccess.enableIdentity) &&
        Objects.equals(this.enableProfile, serviceAccess.enableProfile) &&
        Objects.equals(this.enableGroup, serviceAccess.enableGroup) &&
        Objects.equals(this.enableShare, serviceAccess.enableShare) &&
        Objects.equals(this.enablePrompt, serviceAccess.enablePrompt) &&
        Objects.equals(this.enableService, serviceAccess.enableService) &&
        Objects.equals(this.enableIndex, serviceAccess.enableIndex) &&
        Objects.equals(this.enableUser, serviceAccess.enableUser) &&
        Objects.equals(this.enableAccess, serviceAccess.enableAccess) &&
        Objects.equals(this.enableAccount, serviceAccess.enableAccount) &&
        Objects.equals(this.enableConversation, serviceAccess.enableConversation);
  }

  @Override
  public int hashCode() {
    return Objects.hash(enableShow, enableIdentity, enableProfile, enableGroup, enableShare, enablePrompt, enableService, enableIndex, enableUser, enableAccess, enableAccount, enableConversation);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class ServiceAccess {\n");
    
    sb.append("    enableShow: ").append(toIndentedString(enableShow)).append("\n");
    sb.append("    enableIdentity: ").append(toIndentedString(enableIdentity)).append("\n");
    sb.append("    enableProfile: ").append(toIndentedString(enableProfile)).append("\n");
    sb.append("    enableGroup: ").append(toIndentedString(enableGroup)).append("\n");
    sb.append("    enableShare: ").append(toIndentedString(enableShare)).append("\n");
    sb.append("    enablePrompt: ").append(toIndentedString(enablePrompt)).append("\n");
    sb.append("    enableService: ").append(toIndentedString(enableService)).append("\n");
    sb.append("    enableIndex: ").append(toIndentedString(enableIndex)).append("\n");
    sb.append("    enableUser: ").append(toIndentedString(enableUser)).append("\n");
    sb.append("    enableAccess: ").append(toIndentedString(enableAccess)).append("\n");
    sb.append("    enableAccount: ").append(toIndentedString(enableAccount)).append("\n");
    sb.append("    enableConversation: ").append(toIndentedString(enableConversation)).append("\n");
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
