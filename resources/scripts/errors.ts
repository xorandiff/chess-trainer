import { message } from 'ant-design-vue';
import { ERROR_TYPE } from '@/enums';

export default class Exception {
    public static showMessage(errorType: any) {
        switch (errorType) {
            case ERROR_TYPE.PIECE_MISSING:
                message.error('Error: Piece is missing');
                break;
            default:
                break;
        }
    }
}
