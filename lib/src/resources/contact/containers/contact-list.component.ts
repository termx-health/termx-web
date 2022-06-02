import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {ContactDetail} from 'lib/src/resources/contact/model/contact-detail';
import {NgForm} from '@angular/forms';
import {copyDeep, isDefined} from '@kodality-web/core-util';


@Component({
  selector: 'twl-contact-list',
  templateUrl: './contact-list.component.html',
  styles: [`
    .tw-cs-contact-collapse ::ng-deep {
      .ant-collapse-header {
        align-items: center;
      }

      .ant-collapse-content-box {
        padding: 0;
      }

      .m-table {
        border-radius: 0 0 4px 4px;
      }
    }
  `]
})
export class ContactListComponent {
  @Input() public contacts!: ContactDetail[];
  @Output() public contactsChange: EventEmitter<ContactDetail[]> = new EventEmitter<ContactDetail[]>();

  public modalData: {visible?: boolean, contactIndex?: number, contact?: ContactDetail} = {};

  @ViewChild("form") public form?: NgForm;

  public addContact(): void {
    this.contacts = [...this.contacts || []];
    this.toggleModal({});
  }

  public removeContact(index: number): void {
    this.contacts.splice(index, 1);
    this.contacts = [...this.contacts];
    this.contactsChange.emit(this.contacts);
  }

  public toggleModal(contact?: ContactDetail, index?: number): void {
    this.modalData = {
      visible: !!contact,
      contact: copyDeep(contact),
      contactIndex: index,
    };
  }

  public addModalTelecom(): void {
    this.modalData.contact!.telecoms = [...(this.modalData.contact!.telecoms || []), {}];
  }

  public removeModalTelecom(index: number): void {
    this.modalData.contact!.telecoms!.splice(index, 1);
    this.modalData.contact!.telecoms = [...this.modalData.contact!.telecoms!];
  }

  public confirmModalContact(): void {
    if (isDefined(this.modalData.contactIndex)) {
      this.contacts[this.modalData.contactIndex!] = this.modalData.contact!;
    } else {
      this.contacts = [...this.contacts, this.modalData.contact!];
    }
    this.contactsChange.emit(this.contacts);
    this.toggleModal();
  }
}
