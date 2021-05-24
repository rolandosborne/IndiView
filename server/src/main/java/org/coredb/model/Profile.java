package org.coredb.model;

import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import org.springframework.validation.annotation.Validated;
import javax.validation.Valid;
import javax.validation.constraints.*;

/**
 * Profile
 */
@Validated


public class Profile   {
  @JsonProperty("revision")
  private BigDecimal revision = null;

  @JsonProperty("searchable")
  private Boolean searchable = null;

  @JsonProperty("available")
  private Boolean available = null;

  @JsonProperty("gps")
  private Boolean gps = null;

  @JsonProperty("gpsTimestamp")
  private BigDecimal gpsTimestamp = null;

  @JsonProperty("gpsLongitude")
  private Float gpsLongitude = null;

  @JsonProperty("gpsLatitude")
  private Float gpsLatitude = null;

  public Profile revision(BigDecimal revision) {
    this.revision = revision;
    return this;
  }

  /**
   * Get revision
   * @return revision
   **/
  @Schema(description = "")
  
    @Valid
    public BigDecimal getRevision() {
    return revision;
  }

  public void setRevision(BigDecimal revision) {
    this.revision = revision;
  }

  public Profile searchable(Boolean searchable) {
    this.searchable = searchable;
    return this;
  }

  /**
   * Get searchable
   * @return searchable
   **/
  @Schema(description = "")
  
    public Boolean isSearchable() {
    return searchable;
  }

  public void setSearchable(Boolean searchable) {
    this.searchable = searchable;
  }

  public Profile available(Boolean available) {
    this.available = available;
    return this;
  }

  /**
   * Get available
   * @return available
   **/
  @Schema(description = "")
  
    public Boolean isAvailable() {
    return available;
  }

  public void setAvailable(Boolean available) {
    this.available = available;
  }

  public Profile gps(Boolean gps) {
    this.gps = gps;
    return this;
  }

  /**
   * Get gps
   * @return gps
   **/
  @Schema(description = "")
  
    public Boolean isGps() {
    return gps;
  }

  public void setGps(Boolean gps) {
    this.gps = gps;
  }

  public Profile gpsTimestamp(BigDecimal gpsTimestamp) {
    this.gpsTimestamp = gpsTimestamp;
    return this;
  }

  /**
   * Get gpsTimestamp
   * @return gpsTimestamp
   **/
  @Schema(description = "")
  
    @Valid
    public BigDecimal getGpsTimestamp() {
    return gpsTimestamp;
  }

  public void setGpsTimestamp(BigDecimal gpsTimestamp) {
    this.gpsTimestamp = gpsTimestamp;
  }

  public Profile gpsLongitude(Float gpsLongitude) {
    this.gpsLongitude = gpsLongitude;
    return this;
  }

  /**
   * Get gpsLongitude
   * @return gpsLongitude
   **/
  @Schema(description = "")
  
    public Float getGpsLongitude() {
    return gpsLongitude;
  }

  public void setGpsLongitude(Float gpsLongitude) {
    this.gpsLongitude = gpsLongitude;
  }

  public Profile gpsLatitude(Float gpsLatitude) {
    this.gpsLatitude = gpsLatitude;
    return this;
  }

  /**
   * Get gpsLatitude
   * @return gpsLatitude
   **/
  @Schema(description = "")
  
    public Float getGpsLatitude() {
    return gpsLatitude;
  }

  public void setGpsLatitude(Float gpsLatitude) {
    this.gpsLatitude = gpsLatitude;
  }


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    Profile profile = (Profile) o;
    return Objects.equals(this.revision, profile.revision) &&
        Objects.equals(this.searchable, profile.searchable) &&
        Objects.equals(this.available, profile.available) &&
        Objects.equals(this.gps, profile.gps) &&
        Objects.equals(this.gpsTimestamp, profile.gpsTimestamp) &&
        Objects.equals(this.gpsLongitude, profile.gpsLongitude) &&
        Objects.equals(this.gpsLatitude, profile.gpsLatitude);
  }

  @Override
  public int hashCode() {
    return Objects.hash(revision, searchable, available, gps, gpsTimestamp, gpsLongitude, gpsLatitude);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class Profile {\n");
    
    sb.append("    revision: ").append(toIndentedString(revision)).append("\n");
    sb.append("    searchable: ").append(toIndentedString(searchable)).append("\n");
    sb.append("    available: ").append(toIndentedString(available)).append("\n");
    sb.append("    gps: ").append(toIndentedString(gps)).append("\n");
    sb.append("    gpsTimestamp: ").append(toIndentedString(gpsTimestamp)).append("\n");
    sb.append("    gpsLongitude: ").append(toIndentedString(gpsLongitude)).append("\n");
    sb.append("    gpsLatitude: ").append(toIndentedString(gpsLatitude)).append("\n");
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
