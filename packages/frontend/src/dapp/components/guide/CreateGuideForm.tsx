import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '~~/components/ui/use-toast';
import { Button } from '~~/components/ui/Button';
import { Input } from '~~/components/ui/Input';
import { Textarea } from '~~/components/ui/Textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '~~/components/ui/Card';

interface CreateGuideFormProps {
  gameId: string;
  onSubmit: (data: { title: string; content: string }) => Promise<void>;
}

interface FormData {
  title: string;
  content: string;
}

export const CreateGuideForm: FC<CreateGuideFormProps> = ({ gameId, onSubmit }) => {
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>();

  const onSubmitForm = async (data: FormData) => {
    try {
      await onSubmit(data);
      toast({
        title: '攻略已发布',
        type: 'success',
      });
    } catch (error) {
      toast({
        title: '发布攻略失败',
        description: error instanceof Error ? error.message : '请稍后重试',
        type: 'error',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>发布攻略</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmitForm)}>
        <CardContent className="space-y-4">
          <div>
            <Input
              placeholder="攻略标题"
              {...register('title', { required: '请输入攻略标题' })}
              error={errors.title?.message}
            />
          </div>
          <div>
            <Textarea
              placeholder="分享你的游戏攻略..."
              {...register('content', { 
                required: '请输入攻略内容',
                minLength: { value: 10, message: '攻略内容至少需要10个字符' },
                maxLength: { value: 5000, message: '攻略内容不能超过5000个字符' }
              })}
              error={errors.content?.message}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            发布攻略
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}; 