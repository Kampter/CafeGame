import { FC } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useToast } from '~~/components/ui/use-toast';
import { Button } from '~~/components/ui/Button';
import { Textarea } from '~~/components/ui/Textarea';
import { Input } from '~~/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '~~/components/ui/Card';

interface CreateReviewFormProps {
  onSubmit: (data: { content: string; rating: number }) => Promise<void>;
}

interface FormData {
  content: string;
  rating: number;
}

export const CreateReviewForm: FC<CreateReviewFormProps> = ({ onSubmit }) => {
  const { toast } = useToast();
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<FormData>();

  const onSubmitForm = async (data: FormData) => {
    try {
      await onSubmit(data);
      toast({
        title: '评论已发布',
        type: 'success',
      });
    } catch (error) {
      toast({
        title: '发布评论失败',
        description: error instanceof Error ? error.message : '请稍后重试',
        type: 'error',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>发表评论</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmitForm)}>
        <CardContent className="space-y-4">
          <div>
            <Textarea
              placeholder="分享你的游戏体验..."
              {...register('content', { required: '请输入评论内容' })}
              error={errors.content?.message}
            />
          </div>
          <div>
            <Controller
              name="rating"
              control={control}
              rules={{ required: '请选择评分', min: 1, max: 5 }}
              render={({ field }) => (
                <Input
                  type="number"
                  min={1}
                  max={5}
                  placeholder="评分 (1-5)"
                  {...field}
                  error={errors.rating?.message}
                />
              )}
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
            发布评论
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}; 