type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

export function JsonLd({ data }: JsonLdProps) {
  const payload = Array.isArray(data) ? data : [data];
  const serialized =
    payload.length === 1 ? JSON.stringify(payload[0]) : JSON.stringify(payload);
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialized }} />;
}
