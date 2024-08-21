import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Separator } from '@/components/ui/separator';

interface Props {
    isDialogOpen: boolean;
    setIsDialogOpen: (value: boolean) => void;
}
export const Help: React.FC<Props> = ({ isDialogOpen, setIsDialogOpen }) => {
    return <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className='rounded-lg p-6 pt-8'>
            <DialogHeader className='flex flex-col items-center'>
                <DialogTitle>
                    <p className="font-['Rhodium_Libre'] text-[#3366CC] text-4xl font-[400]">Linkle</p>
                </DialogTitle>
                <DialogDescription>
                    매일 위키피디아 탐험하기
                </DialogDescription>
            </DialogHeader>
            <div className='flex flex-col space-y-6 mt-4'>
                <div className='flex flex-col space-y-4 break-normal'>
                    <div>
                        <span className="font-['Rhodium_Libre'] text-[#3366CC] font-[400]">Linkle</span>은 <a href='https://en.wikipedia.org/wiki/Wikiracing' target='_blank' className='underline font-semibold'>WikiRacing</a> 게임의 규칙을 기반으로 한 한국어 위키백과 탐험 게임입니다.
                    </div>
                    <div>
                        매일 자정, 모두에게 동일한 출발 문서와 도착 문서가 하나씩 제시됩니다.<br />
                        출발 문서에서 시작해 문서의 하이퍼링크들을 타고 도착 문서에 도달하는 것이 목표입니다.<br />
                        뒤로가기 버튼을 통해 직전 문서로 이동할 수 있지만 이동 횟수에 포함됩니다.
                    </div>
                </div>

                <Separator className="my-4" />

                <div className='flex flex-col space-y-4 break-normal'>
                    <div>
                        클리어 이후에는 텍스트로 결과를 공유할 수 있습니다.<br />
                        결과 공유에는 소요 시간과 이동 횟수, 그리고 이모지 배열이 포함됩니다.<br />
                        이모지 배열은 이동 횟수만큼의 정사각형 이모지들과 도착 깃발로 구성되어 있습니다.<br />
                        정사각형 이모지의 색은 이동한 문서와 도착 문서 사이의 의미적 유사도로 결정됩니다.<br />
                    </div>
                    <div>
                        0.2 미만: 🟥 <br />
                        0.2 이상 0.4 미만: 🟧 <br />
                        0.4 이상 0.6 미만: 🟨 <br />
                        0.6 이상 0.8 미만: 🟩 <br />
                        0.8 이상: 🟦 <br />
                        뒤로가기를 통한 이동은 ⏪  이모지로 나타납니다.
                    </div>
                </div>
            </div>
        </DialogContent>
    </Dialog>;
}