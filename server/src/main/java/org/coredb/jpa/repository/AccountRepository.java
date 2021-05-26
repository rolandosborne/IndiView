package org.coredb.view.jpa.repository;

import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.coredb.jpa.entity.Account;

public interface AccountRepository extends JpaRepository<Account, Integer> {
  List<Account> findAll();
  Account findOneByEmigoId(String emigoId);
  Account findOneByLoginToken(String loginToken);
  long count();
}


