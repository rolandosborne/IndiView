package org.coredb.jpa.entity;

import org.coredb.model.Stats;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.io.*;
import javax.persistence.*;

@Entity
@Table(name = "stat", uniqueConstraints = @UniqueConstraint(columnNames = { "id" }))
public class System extends Stats implements Serializable {
  private Integer id;

  public System() { }

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  @Column(name = "id", updatable = false, nullable = false)
  @JsonIgnore
  public Integer getId() {
    return this.id;
  }
  public void setId(Integer value) {
    this.id = value;
  }

  @JsonIgnore
  public Integer getTimestamp() {
    return super.getTimestamp();
  }
  public void setTimestamp(Integer value) {
    super.setTimestamp(value);
  }

  @JsonIgnore
  public Integer getProcessor() {
    return super.getProcessor();
  }
  public void setProcessor(Integer value) {
    super.setProcessor(value);
  }

  @JsonIgnore
  public Long getMemory() {
    return super.getMemory();
  }
  public void setMemory(Long value) {
    super.setMemory(value);
  }

  @JsonIgnore
  public Long getStorage() {
    return super.getStorage();
  }
  public void setStorage(Long value) {
    super.setStorage(value);
  }

  @JsonIgnore
  public Long getRequests() {
    return super.getRequests();
  }
  public void setRequests(Long value) {
    super.setRequests(value);
  }

  @JsonIgnore
  public Long getAccounts() {
    return super.getAccounts();
  }
  public void setAccounts(Long value) {
    super.setAccounts(value);
  }
}


