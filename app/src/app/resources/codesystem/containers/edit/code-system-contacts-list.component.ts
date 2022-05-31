import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {CodeSystemContactDetail} from 'terminology-lib/resources/codesystem/model/code-system-contact-detail';
import {NgForm} from '@angular/forms';
import {copyDeep, isDefined, isNil} from '@kodality-web/core-util';


@Component({
  selector: 'twa-code-system-contacts',
  templateUrl: './code-system-contacts-list.component.html',
})
export class CodeSystemContactsListComponent implements OnInit {
  @Input() public contacts!: CodeSystemContactDetail[];
  @Output() public emittedContacts: EventEmitter<CodeSystemContactDetail[]> = new EventEmitter<CodeSystemContactDetail[]>();

  public modalData: {visible?: boolean, contactsIndex?: number, contact?: CodeSystemContactDetail} = {};

  @ViewChild("form") public form?: NgForm;

  public ngOnInit(): void {
    if (!this.contacts) {
      this.contacts = [];
    }
  }

  public addContact(): void {
    this.contacts = [...this.contacts, {}];
    this.emittedContacts.emit(this.contacts);
  }

  public removeContact(index: number): void {
    if (this.contacts.length < index) {
      return;
    }
    this.contacts.splice(index, 1);
    this.contacts = [...this.contacts];
    this.emittedContacts.emit(this.contacts);
  }

  public toggleModal(contact?: CodeSystemContactDetail, index?: number): void {
    if (contact && isDefined(index)) {
      this.modalData = {visible: true, contactsIndex: index, contact: copyDeep(contact)};
      return;
    }
    this.modalData.visible = false;
  }

  public addModalTelecom(): void {
    if (!this.modalData.contact) {
      return;
    }
    this.modalData.contact.telecoms = [...(this.modalData.contact.telecoms || []), {}];
  }

  public removeModalTelecom(index: number): void {
    if (!this.modalData.contact || !this.modalData.contact.telecoms || this.modalData.contact.telecoms.length < index) {
      return;
    }
    this.modalData.contact.telecoms.splice(index, 1);
    this.modalData.contact.telecoms = [...this.modalData.contact.telecoms];
  }

  public confirmModalContact(): void {
    if (isNil(this.modalData.contactsIndex) || !this.modalData.contact) {
      return;
    }
    this.modalData.visible = false;
    this.contacts[this.modalData.contactsIndex] = this.modalData.contact;
  }
}
