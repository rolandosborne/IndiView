package org.coredb.view.model;

import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.validation.annotation.Validated;
import javax.validation.Valid;
import javax.validation.constraints.*;

/**
 * Settings
 */
@Validated


public class Settings   {
  @JsonProperty("searchable")
  private Boolean searchable = null;

  @JsonProperty("videoQuality")
  private String videoQuality = null;

  @JsonProperty("audioQuality")
  private String audioQuality = null;

  @JsonProperty("videoMute")
  private Boolean videoMute = null;

  @JsonProperty("audioMute")
  private Boolean audioMute = null;

  @JsonProperty("notifications")
  private Boolean notifications = null;

  public Settings searchable(Boolean searchable) {
    this.searchable = searchable;
    return this;
  }

  /**
   * Get searchable
   * @return searchable
   **/
  @Schema(required = true, description = "")
      @NotNull

    public Boolean isSearchable() {
    return searchable;
  }

  public void setSearchable(Boolean searchable) {
    this.searchable = searchable;
  }

  public Settings videoQuality(String videoQuality) {
    this.videoQuality = videoQuality;
    return this;
  }

  /**
   * Get videoQuality
   * @return videoQuality
   **/
  @Schema(required = true, description = "")
      @NotNull

    public String getVideoQuality() {
    return videoQuality;
  }

  public void setVideoQuality(String videoQuality) {
    this.videoQuality = videoQuality;
  }

  public Settings audioQuality(String audioQuality) {
    this.audioQuality = audioQuality;
    return this;
  }

  /**
   * Get audioQuality
   * @return audioQuality
   **/
  @Schema(required = true, description = "")
      @NotNull

    public String getAudioQuality() {
    return audioQuality;
  }

  public void setAudioQuality(String audioQuality) {
    this.audioQuality = audioQuality;
  }

  public Settings videoMute(Boolean videoMute) {
    this.videoMute = videoMute;
    return this;
  }

  /**
   * Get videoMute
   * @return videoMute
   **/
  @Schema(required = true, description = "")
      @NotNull

    public Boolean isVideoMute() {
    return videoMute;
  }

  public void setVideoMute(Boolean videoMute) {
    this.videoMute = videoMute;
  }

  public Settings audioMute(Boolean audioMute) {
    this.audioMute = audioMute;
    return this;
  }

  /**
   * Get audioMute
   * @return audioMute
   **/
  @Schema(required = true, description = "")
      @NotNull

    public Boolean isAudioMute() {
    return audioMute;
  }

  public void setAudioMute(Boolean audioMute) {
    this.audioMute = audioMute;
  }

  public Settings notifications(Boolean notifications) {
    this.notifications = notifications;
    return this;
  }

  /**
   * Get notifications
   * @return notifications
   **/
  @Schema(required = true, description = "")
      @NotNull

    public Boolean isNotifications() {
    return notifications;
  }

  public void setNotifications(Boolean notifications) {
    this.notifications = notifications;
  }


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    Settings settings = (Settings) o;
    return Objects.equals(this.searchable, settings.searchable) &&
        Objects.equals(this.videoQuality, settings.videoQuality) &&
        Objects.equals(this.audioQuality, settings.audioQuality) &&
        Objects.equals(this.videoMute, settings.videoMute) &&
        Objects.equals(this.audioMute, settings.audioMute) &&
        Objects.equals(this.notifications, settings.notifications);
  }

  @Override
  public int hashCode() {
    return Objects.hash(searchable, videoQuality, audioQuality, videoMute, audioMute, notifications);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class Settings {\n");
    
    sb.append("    searchable: ").append(toIndentedString(searchable)).append("\n");
    sb.append("    videoQuality: ").append(toIndentedString(videoQuality)).append("\n");
    sb.append("    audioQuality: ").append(toIndentedString(audioQuality)).append("\n");
    sb.append("    videoMute: ").append(toIndentedString(videoMute)).append("\n");
    sb.append("    audioMute: ").append(toIndentedString(audioMute)).append("\n");
    sb.append("    notifications: ").append(toIndentedString(notifications)).append("\n");
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
