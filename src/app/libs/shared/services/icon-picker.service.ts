import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class IconPickerService {

    private icons: string[] = [
        'account-book', 'alert', 'api', 'appstore', 'audio', 'audit', 'bank', 'bell', 'book',
        'bug', 'bulb', 'calculator', 'calendar', 'camera', 'car', 'carry-out',
        'check-circle', 'clock-circle', 'close-circle', 'cloud', 'code', 'compass',
        'contacts', 'container', 'control', 'credit-card', 'crown', 'customer-service',
        'dashboard', 'database', 'delete', 'dislike', 'dollar', 'environment', 'edit', 'experiment',
        'eye', 'file', 'fire', 'flag', 'folder', 'frown', 'fund', 'gift', 'gold',
        'hdd', 'heart', 'home', 'hourglass', 'idcard', 'insurance', 'interaction',
        'layout', 'like', 'lock', 'mail', 'medicine-box', 'meh', 'message', 'mobile',
        'notification', 'ordered-list', 'phone', 'picture', 'play-square', 'plus', 'printer', 'profile',
        'project', 'pushpin', 'reconciliation', 'red-envelope', 'rest', 'rocket',
        'safety', 'schedule', 'setting', 'shop', 'shopping', 'skin', 'smile',
        'sound', 'star', 'switcher', 'tablet', 'tag', 'tags', 'tool', 'trophy',
        'unlock', 'usb', 'video-camera', 'wallet', 'wifi', 'woman'
    ];

    constructor() { }

    getIcons(): string[] {
        return this.icons;
    }
}
