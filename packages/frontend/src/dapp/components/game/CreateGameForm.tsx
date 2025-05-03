import { Button, Card, Flex, Heading, Select, Spinner, Text, TextArea, TextField } from '@radix-ui/themes';
import { ChangeEvent, FC, FormEvent, useState } from 'react';
import { useCreateGameMutation } from '~~/dapp/hooks/useGameMutations';
import { useSuiClient } from '@mysten/dapp-kit';
import { getAllowlistedKeyServers, SealClient } from '@mysten/seal';
import { fromHex, toHex } from '@mysten/sui/utils';
import { services, storeBlob, WalrusService } from '~~/dapp/utils/walrus';
import useNetworkConfig from '~~/hooks/useNetworkConfig';
import { CONTRACT_PACKAGE_VARIABLE_NAME, CONTRACT_PACKAGE_ID_NOT_DEFINED } from '~~/config/network';

type UploadStatus = 'idle' | 'reading' | 'encrypting' | 'uploading' | 'creating_tx' | 'error';

interface CreateGameFormProps {
  onSuccess?: (createdGameId?: string) => void;
}

const CreateGameForm: FC<CreateGameFormProps> = ({ onSuccess }) => {
  const [name, setName] = useState('');
  const [genre, setGenre] = useState('');
  const [platform, setPlatform] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [packageFile, setPackageFile] = useState<File | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0]?.id || 'service1');

  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const suiClient = useSuiClient();
  const { useNetworkVariable } = useNetworkConfig();
  const packageId = useNetworkVariable(CONTRACT_PACKAGE_VARIABLE_NAME);
  const { createGame, isLoading: isTxPending } = useCreateGameMutation({
    onSuccess: (_data, createdGameId) => {
      setName('');
      setGenre('');
      setPlatform('');
      setPrice('');
      setDescription('');
      setPackageFile(null);
      setUploadStatus('idle');
      setUploadError(null);
      onSuccess?.(createdGameId);
      console.log("CreateGameForm onSuccess, createdGameId:", createdGameId);
    },
  });

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPackageFile(file);
      setUploadError(null);
    } else {
      setPackageFile(null);
    }
  };

  const handleCreateGameFlow = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploadError(null);

    const priceTrimmed = price.trim();
    if (!name.trim() || !genre.trim() || !platform.trim() || !priceTrimmed || !description.trim()) {
      alert('请填写所有游戏信息字段。');
      return;
    }
    if (!/^\d+$/.test(priceTrimmed)) {
      alert('价格必须是非负整数 (单位 SUI)。');
      return;
    }
    if (!packageFile) {
      alert('请选择游戏安装包文件。');
      return;
    }
    if (!packageId || packageId === CONTRACT_PACKAGE_ID_NOT_DEFINED) {
      alert('无法获取合约 Package ID，请检查网络配置。');
      return;
    }

    setUploadStatus('reading');
    let fileUint8Array: Uint8Array;
    try {
      const arrayBuffer = await packageFile.arrayBuffer();
      fileUint8Array = new Uint8Array(arrayBuffer);
    } catch (err: any) {
      console.error("文件读取失败:", err);
      setUploadStatus('error');
      setUploadError(`文件读取失败: ${err.message}`);
      return;
    }

    setUploadStatus('encrypting');
    let encryptedObject: Uint8Array;
    let encryptionId: string;
    try {
      const sealClient = new SealClient({
        suiClient,
        serverObjectIds: getAllowlistedKeyServers('testnet'),
        verifyKeyServers: false, 
      });

      const policyObjectIdForEncryption = packageId;
      console.log("使用 Package ID 作为加密策略上下文:", policyObjectIdForEncryption);

      const nonce = crypto.getRandomValues(new Uint8Array(5)); 
      encryptionId = toHex(new Uint8Array([...fromHex(policyObjectIdForEncryption), ...nonce]));

      console.log("加密中，参数:", { threshold: 2, packageId, id: encryptionId, dataLength: fileUint8Array.length });

      const result = await sealClient.encrypt({
        threshold: 2, 
        packageId: packageId,
        id: encryptionId, 
        data: fileUint8Array,
      });
      encryptedObject = result.encryptedObject;
      console.log("加密成功，密文长度:", encryptedObject.length);

    } catch (err: any) {
      console.error("Seal 加密失败:", err);
      setUploadStatus('error');
      setUploadError(`文件加密失败: ${err.message}`);
      return;
    }

    setUploadStatus('uploading');
    let blobId: string;
    try {
      const numEpochs = 1; 
      const { info } = await storeBlob(encryptedObject, selectedServiceId, numEpochs);
      if ('alreadyCertified' in info) {
        blobId = info.alreadyCertified.blobId;
        console.log("Walrus: Blob 已存在并认证", blobId);
      } else if ('newlyCreated' in info) {
        blobId = info.newlyCreated.blobObject.blobId;
         console.log("Walrus: Blob 新创建", blobId);
      } else {
        throw new Error("无法从 Walrus 响应中提取 blobId");
      }
    } catch (err: any) {
      console.error("Walrus 上传失败:", err);
      setUploadStatus('error');
      setUploadError(`文件上传失败: ${err.message}`);
      return;
    }

    setUploadStatus('creating_tx');
    console.log("准备调用 create_game, blobId:", blobId);
    try {
      createGame(
        name.trim(),
        genre.trim(),
        platform.trim(),
        priceTrimmed,
        description.trim(),
        blobId 
      );
    } catch (err: any) {
      console.error("调用 createGame 时出错 (同步阶段):", err);
      setUploadStatus('error');
      setUploadError(`提交交易时出错: ${err.message}`);
    }
  };

  const getButtonState = (): { text: string; disabled: boolean } => {
    if (isTxPending) return { text: '提交交易中...', disabled: true };
    switch (uploadStatus) {
      case 'reading': return { text: '读取文件中...', disabled: true };
      case 'encrypting': return { text: '加密中...', disabled: true };
      case 'uploading': return { text: '上传中...', disabled: true };
      case 'creating_tx': return { text: '准备交易...', disabled: true };
      case 'error': return { text: '重试创建', disabled: false };
      case 'idle':
      default:
        return { text: '上传并创建游戏', disabled: !packageFile };
    }
  };
  const buttonState = getButtonState();

  return (
    <Card size="3" className="w-full max-w-lg">
      <form onSubmit={handleCreateGameFlow}>
        <Flex direction="column" gap="4">
          <Heading size="4" align="center">Create New Game (Test)</Heading>

          <TextField.Root placeholder="游戏名称" value={name} onChange={(e) => setName(e.target.value)} required size="2" />
          <TextField.Root placeholder="类型 (e.g., RPG, Strategy)" value={genre} onChange={(e) => setGenre(e.target.value)} required size="2" />
          <TextField.Root placeholder="平台 (e.g., PC, Mobile)" value={platform} onChange={(e) => setPlatform(e.target.value)} required size="2" />
          <TextField.Root placeholder="价格 (in MIST, e.g., 1000)" value={price} onChange={(e) => setPrice(e.target.value)} required type="number" min="0" step="1" size="2" />
          <TextArea placeholder="描述" value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} size="2" />

          <Flex direction="column" gap="1">
            <Text as="label" htmlFor="packageFile" size="2" weight="bold">游戏安装包:</Text>
            <input
              id="packageFile"
              type="file"
              onChange={handleFileChange}
              required
              className="text-sm file:mr-4 file:rounded-full file:border-0 file:bg-violet-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-violet-700 hover:file:bg-violet-100"
            />
            {packageFile && <Text size="1" color="gray">已选择: {packageFile.name} ({(packageFile.size / 1024 / 1024).toFixed(2)} MB)</Text>}
          </Flex>

          <Flex direction="column" gap="1">
            <Text as="label" htmlFor="walrusService" size="2" weight="bold">Walrus 存储服务:</Text>
            <Select.Root value={selectedServiceId} onValueChange={setSelectedServiceId}>
              <Select.Trigger id="walrusService" />
              <Select.Content>
                {services.map((service) => (
                  <Select.Item key={service.id} value={service.id}>
                    {service.name} ({service.publisherUrl})
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Flex>

          {uploadError && (
            <Text color="red" size="2">错误: {uploadError}</Text>
          )}

          <Button
            type="submit"
            variant="solid"
            size="3"
            disabled={buttonState.disabled}
          >
            {(uploadStatus !== 'idle' && uploadStatus !== 'error' || isTxPending) && <Spinner size="2" className="mr-2" />}
            {buttonState.text}
          </Button>
        </Flex>
      </form>
    </Card>
  );
};

export default CreateGameForm; 