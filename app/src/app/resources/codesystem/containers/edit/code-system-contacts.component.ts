import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {ContactDetail, Telecom} from 'terminology-lib/resources/codesystem/model/contact-detail';
import {NgForm} from '@angular/forms';


@Component({
  selector: 'twa-code-system-contacts',
  templateUrl: './code-system-contacts.component.html',
})
export class CodeSystemContactsComponent implements OnInit {
  @Input() public contacts!: ContactDetail[];

  public modalVisible = false;
  public modalContact?: ContactDetail;
  public modalTelecoms?: Telecom[];

  @ViewChild("form") public form?: NgForm;

  public ngOnInit(): void {
    if (!this.contacts) {
      this.contacts = [];
    }
  }

  public toggleModal(contact?: ContactDetail): void {
    if (contact) {
      this.modalContact = contact;
      this.modalTelecoms = contact.telecoms;
    }
    this.modalVisible = !this.modalVisible;
  }

  public confirmContact(): void {
    if (!this.modalContact?.telecoms) {
      return;
    }
    this.modalVisible = false;
    this.modalContact.telecoms = this.modalTelecoms;
  }

  public addContact(): void {
    this.contacts = [...this.contacts, {}];
  }

  public removeContact(index: number): void {
    if (this.contacts.length < index) {
      return;
    }
    this.contacts.splice(index, 1);
    this.contacts = [...this.contacts];
  }

  public addContactRow(): void {
    if (!this.modalTelecoms) {
      this.modalTelecoms = [];
    }
    this.modalTelecoms = [...this.modalTelecoms, {}];
  }

  public removeContactRow(index: number): void {
    if (!this.modalTelecoms || this.modalTelecoms.length < index) {
      return;
    }
    this.modalTelecoms.splice(index, 1);
    this.modalTelecoms = [...this.modalTelecoms];
  }
}
