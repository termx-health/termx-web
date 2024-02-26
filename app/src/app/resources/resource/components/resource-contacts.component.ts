import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {BooleanInput, copyDeep, isDefined} from '@kodality-web/core-util';
import {ContactDetail} from 'app/src/app/resources/_lib';


@Component({
  selector: 'tw-resource-contacts',
  templateUrl: './resource-contacts.component.html',
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
export class ResourceContactsComponent {
  @Input() @BooleanInput() public viewMode: boolean | string = false;
  @Input() public contacts!: ContactDetail[];
  @Output() public contactsChange: EventEmitter<ContactDetail[]> = new EventEmitter<ContactDetail[]>();

  public modalData: {
    visible?: boolean,
    contactIndex?: number,
    contact?: ContactDetail
  } = {};

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
    this.modalData.visible = false;
  }
}
