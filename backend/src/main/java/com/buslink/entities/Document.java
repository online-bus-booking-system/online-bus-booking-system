package com.buslink.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "operator_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(callSuper = true)
public class Document extends BaseEntity {

	@ManyToOne
	@JoinColumn(name = "operator_id", nullable = false)
	private BusOperator operator;

	@Column(name = "document_type", nullable = false, length = 50)
	private String documentType; // e.g. "PAN_CARD", "GST_CERTIFICATE", "OPERATING_LICENSE"

	@Column(name = "document_name", nullable = false, length = 100)
	private String documentName;

	@Column(name = "file_path", length = 255)
	private String filePath;
}
