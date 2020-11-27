import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ChatboxService } from '../../shared/chatbox.service';
import * as uikit from 'uikit';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Chatbox } from '../../models/chatbox.model';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { VaService } from '../../va/va.service'
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {
  @ViewChild('queryInput', {static: false}) queryInput: ElementRef;

  chatbox_form: FormGroup;
  chatbox_model = new Chatbox();
  public full_response: any;
  public thinking = false;
  public res_and_que = [];
  public formatted_response = '';
  public success_user_message: string;
  public error_user_message: string;
  project_id: any;
  va_id: any;
  va: any;
  va_tag: any;
  device: any;

  constructor(
    public route: ActivatedRoute,
    public chatbox_service: ChatboxService,
    public form_builder: FormBuilder,
    public va_service: VaService,
    public device_detector_service: DeviceDetectorService,
  ) { }

  ngOnInit() {
    this.initializeChatboxForm();
    this.get_project_and_va_id_from_url()
    this.check_device_type();
  }

  check_device_type() {
    this.device = 'null';

    if(this.device_detector_service.isDesktop()) {
      this.device = 'desktop'
    }
    else if(this.device_detector_service.isMobile()) {
      this.device = 'mobile'
    }
    else if(this.device_detector_service.isTablet()) {
      this.device = 'tablet'
    }

    return this.device;
  }

  initializeChatboxForm(): void {
    this.chatbox_form = this.form_builder.group({
      query: [this.chatbox_model.query, Validators.required]
    });
  }

  get_project_and_va_id_from_url() {
    this.va = this.va_service.get_current_va();
    this.va_id = this.va_service.va_id;
  }

  chatbox_query_form_submit(event: any) {
    const query = this.chatbox_form.getRawValue();
    const utterance = query.query;
    const device = this.check_device_type()
    if (utterance.length > 1) {
      this.thinking = true;
      this.chatbox_service.chatbox_query(query, this.va_id, device).subscribe(
      (test_response) => {
        if (test_response) {
          this.full_response = test_response
          console.log(this.full_response)

          // Default Template > Replace with any
          this.formatted_response = this.parsed_response(this.full_response);

          // Clean up
          this.res_and_que.unshift(this.formatted_response);
          this.res_and_que.unshift(utterance);
          this.thinking = false;
          this.selectInputText();
        }
      },
        (err: HttpErrorResponse) => {
        console.log(err);
        this.error_user_message = err.error;
        this.toggle_user_message(this.error_user_message, 'danger');
        }
      );
    }
  }

  parsed_response(response, format='') {
    format = response.bls_response['parsed_response']
    return format
  }

    // example default template
  //   default_template(response, format='') {
  //     console.log(response);
  //         format = 'you are asking about: ' + '<span class="uk-text-bold">' + response.raw_response.intent['name'] + '</span>' + '<br />';

  //         if (response.raw_response.slots.length >= 1) {
  //           console.log(response.raw_response.slots);
  //         format += ' I have the: <br/>';
  //         response.raw_response.slots.forEach((element, index, array) => {
  //           if (index === (array.length - 1) && array.length > 1) {
  //             format += ' and ' + element.name + ' to be ' + element.value;
  //           } else {
  //             format += ' ' + element.name + ' to be ' + element.value + '<br />';
  //           }
  //         });
  //       }
  //         return format
  // }


  // check_response_type(response) {
  //   if(response.bls_response['parsed_response'] != 'none') {
  //     response = this.parsed_response(response)
  //   } else {
  //     response = this.default_template(response)
  //   }

  //   return response
  // }

  selectInputText() {
    <HTMLInputElement>this.queryInput.nativeElement.select();
  }

  toggle_user_message(notificationMessage, status) {
    uikit.notification(notificationMessage, {pos: 'bottom-right', status: status});
  }

  close_conversation() {
    this.res_and_que = [];
    this.full_response = '';
    this.queryInput.nativeElement.value = '';

  }

}
