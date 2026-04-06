import { Skeleton } from "@/components/ui/skeleton";

interface ConversationButtonsLoaderProps {
  count?: number;
  buttonWidth?: string;
  buttonHeight?: string;
}

export function ConversationButtonsLoader({
  count = 3,
  buttonWidth = "150px",
  buttonHeight = "32px"
}: ConversationButtonsLoaderProps) {
  return (
    <div className="w-full" style={{ marginTop: "5px" }}>
      <div className="flex justify-between w-full overflow-x-auto pb-1">
        <div className="flex flex-row gap-2">
          {Array(count).fill(0).map((_, index) => (
            <Skeleton
              key={index}
              className={`flex-shrink-0 w-[${buttonWidth}] h-[${buttonHeight}] rounded-md`}
            />
          ))}
        </div>
        <Skeleton className={`w-[180px] h-[${buttonHeight}] rounded-md`} />
      </div>
    </div>
  );
}
