package org.coredb.jpa.repository;

import org.springframework.data.jpa.repository.*;
import java.util.List;
import java.util.Set;

import org.coredb.jpa.entity.System;

public interface SystemRepository extends JpaRepository<System, Integer> {
  List<System> findByTimestampLessThanEqualOrderByTimestampDesc(Integer start);
  List<System> findByTimestampGreaterThanEqualOrderByTimestampDesc(Integer end);
  List<System> findByTimestampLessThanEqualAndTimestampGreaterThanEqualOrderByTimestampDesc(Integer start, Integer end);

  List<System> findAllByOrderByTimestampDesc();
  Long deleteByTimestampLessThanEqual(Integer ts);
}



