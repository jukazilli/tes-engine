import { FakeEmailProvider } from './fake-email.provider';

describe('FakeEmailProvider', () => {
  it('captures messages without network access', async () => {
    const provider = new FakeEmailProvider();

    await provider.send({
      type: 'email_verification',
      to: 'usuario@example.test',
      subject: 'Teste',
      text: 'mensagem',
      html: '<p>mensagem</p>',
    });

    expect(provider.listMessages()).toHaveLength(1);
    expect(provider.listMessages()[0]).toEqual(
      expect.objectContaining({ to: 'usuario@example.test' }),
    );
  });
});
