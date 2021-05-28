package org.coredb.view.jpa.entity;

import java.io.*;
import javax.persistence.*;

@Entity
@Table(name = "config", uniqueConstraints = @UniqueConstraint(columnNames = { "id" }))
public class Config implements Serializable {
  private Integer id;
  private String configId;
  private String strValue;
  private Long numValue;
  private Boolean boolValue;

  public Config() { }

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  @Column(name = "id", updatable = false, nullable = false)
  public Integer getId() {
    return this.id;
  }
  public void setId(Integer value) {
    this.id = value;
  }

  public String getConfigId() {
    return this.configId;
  }
  public void setConfigId(String value) {
    this.configId = value;
  }

  public String getStrValue() {
    return this.strValue;
  }
  public void setStrValue(String value) {
    this.strValue = value;
  }

  public Long getNumValue() {
    return this.numValue;
  }
  public void setNumValue(Long value) {
    this.numValue = value;
  }

  public Boolean getBoolValue() {
    return this.boolValue;
  }
  public void setBoolValue(Boolean value) {
    this.boolValue = value;
  }

}


