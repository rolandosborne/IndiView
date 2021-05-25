package org.coredb.jpa.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.io.*;
import javax.persistence.*;

@Entity
@Table(name = "account", uniqueConstraints = @UniqueConstraint(columnNames = { "id" }))
public class Account implements Serializable {
  private Integer id;
  private String amigoId;
  private Integer revision;
  private String handle;
  private String name;
  private String registry;
  private Boolean enabled;
  private Boolean searchable;
  private String token;
  private String videoQuality;
  private String audioQuality;
  private Boolean videoMute;
  private Boolean audioMute;
  private Boolean gps;
  private Float gpsLongitude;
  private Float gpsLatitude;
  private Float gpsAltitude;
  private Long gpsTimestamp;

  public Account() {
  }

  @Id
  @JsonIgnore
  @GeneratedValue(strategy = GenerationType.AUTO)
  @Column(name = "id", updatable = false, nullable = false)
  public Integer getId() {
    return this.id;
  }
  public void setId(Integer value) {
    this.id = value;
  }

  @JsonIgnore
  public String getAmigoId() {
    return this.amigoId;
  }
  public void setAmigoId(String value) {
    this.amigoId = value;
  }

  @JsonIgnore
  public Integer getRevision() {
    return this.revision;
  }
  public void setRevision(Integer value) {
    this.revision = value;
  }
   
  @JsonIgnore
  public String getHandle() {
    return this.handle;
  }
  public void setHandle(String value) {
    this.handle = value;
  }

  @JsonIgnore
  public String getName() {
    return this.name;
  }
  public void setName(String value) {
    this.name = value;
  }

  @JsonIgnore
  public String getRegistry() {
    return this.registry;
  }
  public void setRegistry(String value) {
    this.registry = value;
  }

  @JsonIgnore
  public Boolean getEnabled() {
    return this.enabled;
  }
  public void setEnabled(Boolean value) {
    this.enabled = value;
  }

  @JsonIgnore
  public Boolean getSearchable() {
    return this.searchable;
  }
  public void setSearchable(Boolean value) {
    this.searchable = value;
  }

  @JsonIgnore
  public String getToken() {
    return this.token;
  }
  public void setToken(String value) {
    this.token = value;
  }

  @JsonIgnore
  public String getVideoQuality() {
    return this.videoQuality;
  }
  public void setVideoQuality(String value) {
    this.videoQuality = value;
  }

  @JsonIgnore
  public String getAudioQuality() {
    return this.audioQuality;
  }
  public void setAudioQuality(String value) {
    this.audioQuality = value;
  }

  @JsonIgnore
  public Boolean getVideoMute() {
    return this.videoMute;
  }
  public void setVideoMute(Boolean value) {
    this.videoMute = value;
  }

  @JsonIgnore
  public Boolean getAudioMute() {
    return this.audioMute;
  }
  public void setAudioMute(Boolean value) {
    this.audioMute = value;
  }

  @JsonIgnore
  public Boolean getGps() {
    return this.gps;
  }
  public void setGps(Boolean value) {
    this.gps = value;
  }

  @JsonIgnore
  public Float getGpsLongitude() {
    return this.gpsLongitude;
  }
  public void setGpsLongitude(Float value) {
    this.gpsLongitude = value;
  }

  @JsonIgnore
  public Float getGpsLatitude() {
    return this.gpsLatitude;
  }
  public void setGpsLatitude(Float value) {
    this.gpsLatitude = value;
  }

  @JsonIgnore
  public Float getGpsAltitude() {
    return this.gpsAltitude;
  }
  public void setGpsAltitude(Float value) {
    this.gpsAltitude = value;
  }

  @JsonIgnore
  public Long getGpsTimestamp() {
    return this.gpsTimestamp;
  }
  public void setGpsTimestamp(Long value) {
    this.gpsTimestamp = value;
  }
}
