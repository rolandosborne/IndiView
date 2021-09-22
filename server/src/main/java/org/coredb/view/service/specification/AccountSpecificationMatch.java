package org.coredb.view.service.specification;

import java.io.*;
import java.text.*;
import java.util.*;
import java.sql.Timestamp;

import org.coredb.view.jpa.entity.Account;
import javax.persistence.criteria.*;

import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.*;

import com.fasterxml.jackson.core.*;
import com.fasterxml.jackson.databind.*;

public class AccountSpecificationMatch implements Specification<Account> {
  private String match;
  private String amigoId;
  private Long alert;

  public AccountSpecificationMatch(String amigoId, String match, Long alert) {
    this.match = match;
    this.amigoId = amigoId;
    this.alert = alert;
  }

  @Override
  public Predicate toPredicate (Root<Account> root, CriteriaQuery<?> query, CriteriaBuilder builder) {
    Predicate alert = builder.lessThan(root.<Long>get("alertTimestamp"), this.alert);
    Predicate handle = builder.like(root.<String>get("handle"), "%" + match + "%");
    Predicate name = builder.like(root.<String>get("name"), "%" + match + "%");
    Predicate id = builder.notEqual(root.<String>get("amigoId"), amigoId);
    Predicate search = builder.equal(root.<Boolean>get("searchable"), true);
    Predicate or = builder.or(name, handle);
    return builder.and(id, or, search, alert);
  }
}
