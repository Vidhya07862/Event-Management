package com.eventmgmt.repository;

import com.eventmgmt.model.MailMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MailMessageRepository extends JpaRepository<MailMessage, Long> {
    List<MailMessage> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);
    List<MailMessage> findBySenderIdOrderByCreatedAtDesc(Long senderId);
}
